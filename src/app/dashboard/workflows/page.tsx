'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, Background, Controls, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Plus, Play, Save, ChevronRight, GripVertical, AlertTriangle } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import TriggerNode from '../../../components/workflow/nodes/TriggerNode';
import ConditionNode from '../../../components/workflow/nodes/ConditionNode';
import ActionNode from '../../../components/workflow/nodes/ActionNode';
import { motion } from 'framer-motion';

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 100 }, data: { label: 'Spend Anomaly', description: 'If Spend > $100 in 1 hour' } },
  { id: '2', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'Check ROAS', description: 'If ROAS < 0.8' } },
  { id: '3', type: 'action', position: { x: 250, y: 400 }, data: { label: 'Pause Ad Set', description: 'Stop bleeding budget' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
];

function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isSaved, setIsSaved] = useState(true);

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setIsSaved(false);
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      setIsSaved(false);
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
      setIsSaved(false);
    },
    []
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.getElementById('reactflow-wrapper')?.getBoundingClientRect();
      const rawData = event.dataTransfer.getData('application/reactflow');
      
      if (!rawData || !reactFlowBounds) return;

      const { type, label } = JSON.parse(rawData);

      // Simplified position calculation (in production use ReactFlow instance project)
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode: Node = {
        id: `dndnode_${Date.now()}`,
        type,
        position,
        data: { label, description: 'Configure node...' },
      };

      setNodes((nds) => nds.concat(newNode));
      setIsSaved(false);
    },
    [setNodes]
  );

  return (
    <div className="flex h-[calc(100vh-120px)] w-full gap-4">
      {/* SIDEBAR: Nodes Palette */}
      <div className="w-64 flex flex-col gap-4">
        <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
          <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add Node
          </h3>
          
          <div className="space-y-3">
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
              onDragStart={(e) => onDragStart(e, 'trigger', 'New Trigger')}
              draggable
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-white font-medium">Trigger</span>
            </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
              onDragStart={(e) => onDragStart(e, 'condition', 'New Condition')}
              draggable
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-white font-medium">Condition</span>
            </div>

            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
              onDragStart={(e) => onDragStart(e, 'action', 'New Action')}
              draggable
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-white font-medium">Action</span>
            </div>
          </div>
        </div>
        
        {/* Helper Card */}
        <div className="mt-auto bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-white/80">
          <AlertTriangle className="w-5 h-5 text-primary mb-2" />
          Drag and drop nodes onto the canvas to construct your deterministic marketing guardrails.
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 bg-surface/50 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl backdrop-blur-sm" id="reactflow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="dark"
        >
          <Background color="rgba(255, 255, 255, 0.05)" gap={16} />
          <Controls className="fill-white bg-surface border border-white/10 rounded-xl overflow-hidden [&>button]:border-white/10 [&>button]:text-white [&>button]:hover:bg-white/10" />
        </ReactFlow>

        {/* Top Floating Action Bar */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <button 
            onClick={() => setIsSaved(true)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-white/5 text-white/50 border border-white/5' : 'bg-surface text-white border border-primary shadow-glow-primary'}`}
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Saved' : 'Save Changes'}
          </button>
          
          <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-colors">
            <Play className="w-4 h-4" />
            Activate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { isPremium } = useStore();

  if (!isPremium) return null; // Guarded by Sidebar UpgradeModal

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            Workflow Canvas
          </h1>
          <p className="text-muted mt-1">Design deterministic, n8n-style marketing guardrails using a visual node builder.</p>
        </div>
      </div>

      {/* React Flow Provider MUST wrap the React Flow instance */}
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}
