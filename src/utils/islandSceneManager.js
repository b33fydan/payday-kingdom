import * as THREE from 'three';
import {
  createWheatField,
  createHayBale,
  createLogPile,
  createFarmhouse,
  createFlag,
  VOXEL_SIZE
} from './voxelBuilder';

/**
 * IslandSceneManager
 * Subscribes to Zustand stores and syncs Three.js scene in real-time.
 * Handles agent positioning, resource piles, zone flags, and farmhouse.
 * 
 * DO NOT re-render entire scene on every change.
 * Track what's in the scene and only add/remove/update what changed.
 */
export class IslandSceneManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain; // 8x8 array of { x, z, type }
    
    // Mesh tracking
    this.agentMeshes = new Map(); // agentId → THREE.Group
    this.resourceMeshes = new Map(); // tileIndex → THREE.Group (wheat/hay/log pile)
    this.flagMeshes = new Map(); // tileIndex → THREE.Group (zone flag)
    this.farmhouse = null;
    
    // Current state tracking
    this.currentAgents = new Map(); // agentId → agent object
    this.currentResources = { wood: 0, wheat: 0, hay: 0 };
  }

  /**
   * Initialize static props (farmhouse, terrain features)
   * Call once on scene setup
   */
  initStaticProps() {
    const centerTile = this.getTileAtIndex(27); // Approximately center of 8x8 grid
    if (centerTile) {
      this.farmhouse = createFarmhouse(centerTile.x, centerTile.z);
      this.scene.add(this.farmhouse);
    }
  }

  /**
   * Sync scene with current game state
   * Called when agents or resources change
   */
  syncScene(agents, resources, terrainGrid) {
    // Update terrain if provided (happens once on init)
    if (terrainGrid && terrainGrid.length > 0) {
      this.terrain = terrainGrid;
    }

    // Sync agents
    this.syncAgents(agents);

    // Sync resources (only if changed)
    if (
      resources.wood !== this.currentResources.wood ||
      resources.wheat !== this.currentResources.wheat ||
      resources.hay !== this.currentResources.hay
    ) {
      this.syncResourcePiles(agents, resources);
      this.currentResources = { ...resources };
    }
  }

  /**
   * Sync agent meshes to current agent list
   * Adds new agents, updates positions, removes fired agents
   */
  syncAgents(agents) {
    const currentIds = new Set(agents.map((a) => a.id));
    const existingIds = new Set(this.agentMeshes.keys());

    // Remove agents that were fired
    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        const mesh = this.agentMeshes.get(id);
        this.scene.remove(mesh);
        this.agentMeshes.delete(id);

        // Also remove their flag if assigned
        const tileIndex = this.getTileIndexForAgent(id);
        if (tileIndex !== -1 && this.flagMeshes.has(tileIndex)) {
          const flag = this.flagMeshes.get(tileIndex);
          this.scene.remove(flag);
          this.flagMeshes.delete(tileIndex);
        }
      }
    });

    // Add new agents or update existing positions
    agents.forEach((agent) => {
      if (!this.agentMeshes.has(agent.id)) {
        // New agent - create mesh
        const agentMesh = this.createAgentMesh(agent);
        this.scene.add(agentMesh);
        this.agentMeshes.set(agent.id, agentMesh);
      }

      // Update position
      const agentMesh = this.agentMeshes.get(agent.id);
      const position = this.getAgentPosition(agent, agents);
      agentMesh.position.set(position.x, position.y, position.z);

      // Update zone flag
      this.syncZoneFlag(agent);

      // Store current state
      this.currentAgents.set(agent.id, agent);
    });
  }

  /**
   * Create a simple agent mesh (voxel body with label)
   */
  createAgentMesh(agent) {
    const wrapper = new THREE.Group();
    wrapper.userData.agentId = agent.id;

    // Simple voxel body (colored cube)
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: agent.appearance.bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    body.castShadow = true;
    body.receiveShadow = true;
    wrapper.add(body);

    // Simple head
    const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const headMaterial = new THREE.MeshStandardMaterial({ color: '#f1c7a3' }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.55;
    head.castShadow = true;
    head.receiveShadow = true;
    wrapper.add(head);

    // Morale bar (canvas texture on top)
    const moraleLabel = this.createMoraleLabel(agent);
    wrapper.add(moraleLabel);

    return wrapper;
  }

  /**
   * Create morale visualization (small bar above agent)
   */
  createMoraleLabel(agent) {
    const labelGroup = new THREE.Group();

    // Morale bar background (dark)
    const bgGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.05);
    const bgMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.y = 0.75;
    labelGroup.add(bg);

    // Morale bar foreground (colored based on morale)
    const moraleColor = this.getMoraleColor(agent.morale);
    const fgGeometry = new THREE.BoxGeometry((agent.morale / 100) * 0.38, 0.06, 0.06);
    const fgMaterial = new THREE.MeshStandardMaterial({ color: moraleColor, emissive: moraleColor, emissiveIntensity: 0.3 });
    const fg = new THREE.Mesh(fgGeometry, fgMaterial);
    fg.position.y = 0.75;
    fg.position.z = 0.02;
    labelGroup.add(fg);

    return labelGroup;
  }

  /**
   * Get morale color (green → yellow → red)
   */
  getMoraleColor(morale) {
    if (morale >= 70) return 0x22c55e; // Green
    if (morale >= 40) return 0xeab308; // Yellow
    return 0xef4444; // Red
  }

  /**
   * Calculate agent position based on assignment
   */
  getAgentPosition(agent, allAgents) {
    if (agent.assignedZone) {
      // Position at assigned zone (use zone name as rough position)
      const zonePositions = {
        forest: { x: -2.5, z: -0.5 },
        plains: { x: 0, z: 1 },
        wetlands: { x: 2.5, z: -0.5 }
      };
      const zonePos = zonePositions[agent.assignedZone] || zonePositions.plains;
      const randomOffset = { x: (Math.random() - 0.5) * 0.5, z: (Math.random() - 0.5) * 0.5 };
      return {
        x: zonePos.x + randomOffset.x,
        y: 0.5,
        z: zonePos.z + randomOffset.z
      };
    }

    // Idle near farmhouse (cluster near center)
    const unassignedAgents = allAgents.filter((a) => !a.assignedZone);
    const agentIndex = unassignedAgents.findIndex((a) => a.id === agent.id);
    const defaultPositions = [
      { x: -0.5, z: -1.5 },
      { x: 0, z: -1.7 },
      { x: 0.5, z: -1.5 }
    ];
    const pos = defaultPositions[agentIndex % defaultPositions.length];
    return {
      x: pos.x,
      y: 0.5,
      z: pos.z
    };
  }

  /**
   * Sync zone flag for assigned agent
   */
  syncZoneFlag(agent) {
    // First, remove flag if agent was previously assigned elsewhere
    this.flagMeshes.forEach((flag, tileIndex) => {
      if (flag.userData.agentId === agent.id && flag.userData.tileIndex !== agent.assignedZone) {
        this.scene.remove(flag);
        this.flagMeshes.delete(tileIndex);
      }
    });

    // Create or update flag if assigned
    if (agent.assignedZone) {
      const tileIndex = this.getTileIndex(agent.assignedZone);
      
      if (tileIndex !== -1 && !this.flagMeshes.has(tileIndex)) {
        const tile = this.getTileAtIndex(tileIndex);
        if (tile) {
          const flag = createFlag(tile.x - 0.3, tile.z - 0.3, agent.appearance.bodyColor);
          flag.userData.agentId = agent.id;
          flag.userData.tileIndex = tileIndex;
          this.scene.add(flag);
          this.flagMeshes.set(tileIndex, flag);
        }
      }
    }
  }

  /**
   * Sync resource piles based on agents + resources
   */
  syncResourcePiles(agents, resources) {
    // Clear old resource meshes
    this.resourceMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.resourceMeshes.clear();

    // For each assigned agent, create resource pile on their tile
    agents.forEach((agent) => {
      if (!agent.assignedZone) return;

      const tileIndex = this.getTileIndex(agent.assignedZone);
      if (tileIndex === -1) return;

      const tile = this.getTileAtIndex(tileIndex);
      if (!tile) return;

      // Determine resource type by zone
      let resourceMesh = null;
      let resourceCount = 0;

      if (agent.assignedZone === 'forest') {
        resourceCount = Math.min(5, Math.floor(resources.wood / 5));
        if (resourceCount > 0) {
          resourceMesh = createLogPile(tile.x + 0.3, tile.z + 0.3, resourceCount);
        }
      } else if (agent.assignedZone === 'plains') {
        const growthStage = Math.min(3, Math.floor(resources.wheat / 8));
        if (growthStage > 0) {
          resourceMesh = createWheatField(tile.x + 0.3, tile.z + 0.3, growthStage);
        }
      } else if (agent.assignedZone === 'wetlands') {
        resourceCount = Math.min(3, Math.floor(resources.hay / 8));
        if (resourceCount > 0) {
          resourceMesh = createHayBale(tile.x + 0.3, tile.z + 0.3, resourceCount);
        }
      }

      if (resourceMesh) {
        this.scene.add(resourceMesh);
        this.resourceMeshes.set(tileIndex, resourceMesh);
      }
    });
  }

  /**
   * Helper: Get tile at given index (0-63 for 8x8 grid)
   */
  getTileAtIndex(index) {
    return this.terrain[index] || null;
  }

  /**
   * Helper: Get tile index for zone name
   */
  getTileIndex(zoneName) {
    // This is simplified - in a real system, you'd map zone to specific tiles
    // For now, just use zone name as a pseudo-index
    const zoneMap = { forest: 0, plains: 27, wetlands: 56 };
    return zoneMap[zoneName] || -1;
  }

  /**
   * Helper: Get tile index for agent (finds their assignment)
   */
  getTileIndexForAgent(agentId) {
    const agent = this.currentAgents.get(agentId);
    if (!agent || !agent.assignedZone) return -1;
    return this.getTileIndex(agent.assignedZone);
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.agentMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.resourceMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.flagMeshes.forEach((mesh) => this.scene.remove(mesh));
    if (this.farmhouse) {
      this.scene.remove(this.farmhouse);
    }

    this.agentMeshes.clear();
    this.resourceMeshes.clear();
    this.flagMeshes.clear();
  }
}
