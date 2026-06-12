'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, Background, Controls, applyNodeChanges, applyEdgeChanges, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Plus, Play, Save, ChevronRight, GripVertical, AlertTriangle, ShieldCheck, FileCode2, X } from 'lucide-react';
import { useStore } from '../../../client/store/useStore';
import TriggerNode from '../../../client/components/workflow/nodes/TriggerNode';
import ConditionNode from '../../../client/components/workflow/nodes/ConditionNode';
import ActionNode from '../../../client/components/workflow/nodes/ActionNode';
import { motion } from 'framer-motion';
// convex import removed
// convex import removed

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const defaultNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 100 }, data: { label: 'Spend Anomaly', description: 'If Spend > $100 in 1 hour' } },
  { id: '2', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'Check ROAS', description: 'If ROAS < 0.8' } },
  { id: '3', type: 'action', position: { x: 250, y: 400 }, data: { label: 'Pause Ad Set', description: 'Stop bleeding budget' } },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
];

function FlowCanvas() {
  const { user } = useStore();
  const orgId = user?.organizationId || 'default-org';
  
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [isSaved, setIsSaved] = useState(true);
  const [workflowId, setWorkflowId] = useState<any>(null);
  
  // New UI States
  const [showTemplates, setShowTemplates] = useState(false);
  const { isAuditMode, setAuditMode } = useStore();

  // Load from DB when available
  useEffect(() => {
    async function loadWorkflows() {
      try {
        const res = await fetch('/api/workflows', {
          headers: { 'x-organization-id': orgId }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.length > 0) {
          const dbWorkflow = data[0];
          setWorkflowId(dbWorkflow.id);
          if (dbWorkflow.nodes?.length) setNodes(dbWorkflow.nodes);
          if (dbWorkflow.edges?.length) setEdges(dbWorkflow.edges);
          setIsSaved(true);
        }
      } catch (err) {
        console.error("Failed to load workflows:", err);
      }
    }
    if (orgId !== 'default-org') {
      loadWorkflows();
    }
  }, [orgId]);

  const handleSave = async () => {
    setIsSaved(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          id: workflowId,
          name: 'Main Automation',
          nodes,
          edges,
          status: 'active'
        })
      });
      if (!res.ok) throw new Error("Save failed");
      const savedData = await res.json();
      if (!workflowId) setWorkflowId(savedData.id);
    } catch (e) {
      console.error("Failed to save workflow:", e);
      setIsSaved(false);
    }
  };

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

      // Simplified position calculation
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

  const loadTemplate = (templateName: string) => {
    if (templateName === '7_day_scale') {
      setNodes([
        { id: '1', type: 'trigger', position: { x: 250, y: 100 }, data: { label: 'Active Duration', description: 'Days Active > 7' } },
        { id: '2', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'High ROAS', description: 'If 7D ROAS > 2.5' } },
        { id: '3', type: 'action', position: { x: 250, y: 400 }, data: { label: 'Scale Budget', description: 'Increase by 15%' } },
      ]);
      setEdges([
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      ]);
    } else if (templateName === 'weekend_stop_loss') {
      setNodes([
        { id: '1', type: 'trigger', position: { x: 250, y: 100 }, data: { label: 'Weekend Detected', description: 'Day is Sat/Sun' } },
        { id: '2', type: 'condition', position: { x: 250, y: 250 }, data: { label: 'Bleeding Budget', description: 'If Spend > $100 & ROAS < 1.0' } },
        { id: '3', type: 'action', position: { x: 250, y: 400 }, data: { label: 'Pause Ad Set', description: 'Hard Stop' } },
      ]);
      setEdges([
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      ]);
    }
    setIsSaved(false);
    setShowTemplates(false);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] w-full gap-4 relative">
      {/* Template Modal */}
      {showTemplates && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <FileCode2 className="w-6 h-6 text-primary" />
                Template Library
              </h2>
              <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => loadTemplate('7_day_scale')}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 text-left transition group"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition">7-Day Scaling Protocol</h3>
                <p className="text-sm text-slate-400">Automatically scales budget by 15% for adsets running &gt;7 days with ROAS &gt;2.5.</p>
              </button>
              
              <button 
                onClick={() => loadTemplate('weekend_stop_loss')}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 text-left transition group"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition">E-Comm Weekend Stop-Loss</h3>
                <p className="text-sm text-slate-400">Instantly pauses any campaign on Sat/Sun that spends over $100 with ROAS &lt;1.0.</p>
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
          
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-xl border border-white/10 mr-4">
            <span className={`text-xs font-bold ${isAuditMode ? 'text-success' : 'text-slate-500'}`}>Audit Mode</span>
            <button 
              onClick={() => setAuditMode(!isAuditMode)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isAuditMode ? 'bg-success' : 'bg-red-500'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isAuditMode ? 'left-0.5' : 'left-[22px]'}`} />
            </button>
            <span className={`text-xs font-bold ${!isAuditMode ? 'text-red-400' : 'text-slate-500'}`}>Auto-Execute</span>
          </div>

          <button 
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-2 transition"
          >
            <FileCode2 className="w-4 h-4" />
            Templates
          </button>

          <button 
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-white/5 text-white/50 border border-white/5' : 'bg-surface text-white border border-primary shadow-glow-primary'}`}
          >
            <Save className="w-4 h-4" />
            {isSaved ? 'Saved to DB' : 'Save Changes'}
          </button>
          
          <button className={`px-5 py-2 text-white font-bold rounded-xl flex items-center gap-2 transition-colors ${isAuditMode ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
            <Play className="w-4 h-4" />
            {isAuditMode ? 'Start Auditing' : 'Activate Live'}
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
