// Lang's Memory Graph Visualization
// Powered by vis.js with custom Lang-specific features

let network = null;
let nodes = null;
let edges = null;
let allNodes = [];
let allEdges = [];
let memoryData = null;

// Initialize the graph when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMemoryData();
    setupEventListeners();
});

async function loadMemoryData() {
    try {
        console.log('Loading memory data...');
        
        // Try Netlify function first for live data
        let response;
        try {
            response = await fetch('/.netlify/functions/get-memories');
            console.log('Loading live data from database...');
        } catch (funcError) {
            console.log('Netlify function not available, falling back to static JSON');
            response = await fetch('memories.json');
        }
        
        if (!response.ok) {
            // If function fails, try static JSON as fallback
            console.log('Primary fetch failed, trying static JSON fallback...');
            response = await fetch('memories.json');
        }
        
        memoryData = await response.json();
        
        // Check if we got an error response from the function
        if (memoryData.error) {
            console.error('Database error:', memoryData.message);
            console.log('Using fallback static data if available...');
            // Try to load static JSON as final fallback
            const fallbackResponse = await fetch('memories.json');
            if (fallbackResponse.ok) {
                memoryData = await fallbackResponse.json();
            }
        }
        
        console.log('Memory data loaded:', memoryData);
        console.log(`Loaded ${memoryData.nodes?.length || 0} nodes and ${memoryData.edges?.length || 0} edges`);
        
        initializeGraph();
        updateStats();
        updateTrustNetwork();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading memory data:', error);
        showError('Failed to load memory data. The server may be temporarily unavailable.');
    }
}

function initializeGraph() {
    if (!memoryData) return;
    
    // Prepare nodes and edges
    allNodes = memoryData.nodes.map(node => ({
        ...node,
        font: {
            color: '#ffffff',
            size: 12,
            face: 'Inter, sans-serif'
        },
        shadow: {
            enabled: true,
            color: 'rgba(255, 255, 255, 0.3)',
            size: 5
        },
        borderWidth: 2,
        chosen: {
            node: function(values, id, selected, hovering) {
                values.shadow = true;
                values.shadowColor = 'rgba(114, 137, 218, 0.8)';
                values.shadowSize = 10;
            }
        }
    }));
    
    allEdges = memoryData.edges.map(edge => ({
        ...edge,
        smooth: {
            enabled: true,
            type: 'continuous'
        },
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.5
            }
        }
    }));
    
    // Create DataSets
    nodes = new vis.DataSet(allNodes);
    edges = new vis.DataSet(allEdges);
    
    // Create network
    const container = document.getElementById('memory-graph');
    const data = { nodes: nodes, edges: edges };
    
    const options = {
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 100
            },
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
            hideNodesOnDrag: false
        },
        nodes: {
            shape: 'dot',
            scaling: {
                min: 5,
                max: 30
            },
            font: {
                size: 12,
                color: '#ffffff'
            },
            mass: 1,                              // Standard mass for physics
            borderWidth: 2,
            borderWidthSelected: 3
        },
        edges: {
            width: 1,
            color: {
                color: '#666666',
                highlight: '#7289da',
                hover: '#7289da'
            },
            smooth: {
                enabled: true,
                type: 'continuous'
            }
        },
        layout: {
            improvedLayout: true
        }
    };
    
    network = new vis.Network(container, data, options);
    
    // Event listeners
    network.on('click', handleNodeClick);
    network.on('hoverNode', handleNodeHover);
    network.on('blurNode', handleNodeBlur);
    
    console.log('Graph initialized with', allNodes.length, 'nodes and', allEdges.length, 'edges');
}

function handleNodeClick(params) {
    if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = allNodes.find(n => n.id === nodeId);
        
        if (node) {
            showNodeDetails(node);
        }
    } else {
        clearNodeDetails();
    }
}

function handleNodeHover(params) {
    const nodeId = params.node;
    const node = allNodes.find(n => n.id === nodeId);
    
    if (node && node.title) {
        // Tooltip is handled by vis.js automatically
    }
}

function handleNodeBlur(params) {
    // Node blur handling if needed
}

function showNodeDetails(node) {
    const sidebar = document.getElementById('sidebar');
    const content = sidebar.querySelector('.sidebar-content');
    
    // Remove existing details
    const existingDetails = content.querySelector('.memory-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    
    // Create new details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'memory-details';
    
    let detailsHTML = `<h4>${node.label}</h4>`;
    
    if (node.type === 'entity' && node.trust_level !== undefined) {
        detailsHTML += `
            <p><strong>Trust Level:</strong> <span class="trust-level ${getTrustClass(node.trust_level)}">${node.trust_level.toFixed(1)}</span></p>
            <p><strong>Type:</strong> Entity (Person)</p>
        `;
    } else if (node.content) {
        detailsHTML += `<p>${node.content.summary || node.title || 'No description available'}</p>`;
        
        if (node.importance !== undefined) {
            detailsHTML += `<p><strong>Importance:</strong> ${node.importance.toFixed(1)}/1.0</p>`;
        }
        
        if (node.emotional_weight !== undefined) {
            const emotion = node.emotional_weight > 0 ? 'Positive' : node.emotional_weight < 0 ? 'Negative' : 'Neutral';
            detailsHTML += `<p><strong>Emotional Weight:</strong> ${emotion} (${node.emotional_weight.toFixed(1)})</p>`;
        }
        
        if (node.access_count !== undefined) {
            detailsHTML += `<p><strong>Times Accessed:</strong> ${node.access_count}</p>`;
        }
    }
    
    // Add metadata
    if (node.created_at || node.type) {
        detailsHTML += `<div class="memory-meta">`;
        if (node.type) {
            detailsHTML += `Type: ${node.type}<br>`;
        }
        if (node.created_at) {
            const date = new Date(node.created_at);
            detailsHTML += `Created: ${date.toLocaleDateString()}`;
        }
        detailsHTML += `</div>`;
    }
    
    detailsDiv.innerHTML = detailsHTML;
    content.appendChild(detailsDiv);
}

function clearNodeDetails() {
    const sidebar = document.getElementById('sidebar');
    const content = sidebar.querySelector('.sidebar-content');
    const existingDetails = content.querySelector('.memory-details');
    
    if (existingDetails) {
        existingDetails.remove();
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);
    
    // Reset view button
    const resetButton = document.getElementById('reset-view');
    resetButton.addEventListener('click', resetView);
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (!query) {
        // Show all nodes
        nodes.update(allNodes);
        return;
    }
    
    // Filter nodes based on search query
    const filteredNodes = allNodes.filter(node => {
        const label = (node.label || '').toLowerCase();
        const title = (node.title || '').toLowerCase();
        const type = (node.type || '').toLowerCase();
        
        return label.includes(query) || 
               title.includes(query) || 
               type.includes(query) ||
               (node.content && JSON.stringify(node.content).toLowerCase().includes(query));
    });
    
    // Get connected edges
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = allEdges.filter(edge => 
        filteredNodeIds.has(edge.from) || filteredNodeIds.has(edge.to)
    );
    
    // Update display
    nodes.clear();
    edges.clear();
    nodes.add(filteredNodes);
    edges.add(filteredEdges);
    
    // Focus on filtered nodes
    if (filteredNodes.length > 0) {
        network.fit({
            nodes: filteredNodes.map(n => n.id),
            animation: true
        });
    }
}

function resetView() {
    if (!network) return;
    
    // Reset search
    document.getElementById('search').value = '';
    
    // Show all nodes and edges
    nodes.clear();
    edges.clear();
    nodes.add(allNodes);
    edges.add(allEdges);
    
    // Fit to all nodes
    network.fit({
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
    
    // Clear details
    clearNodeDetails();
}

function updateStats() {
    if (!memoryData) return;
    
    const statsDiv = document.getElementById('stats');
    const totalNodes = memoryData.nodes.length;
    const totalEdges = memoryData.edges.length;
    const exportTime = new Date(memoryData.metadata.exported_at);
    
    statsDiv.innerHTML = `
        ${totalNodes} memories | ${totalEdges} connections | 
        Updated: ${exportTime.toLocaleDateString()}
    `;
}

function updateTrustNetwork() {
    if (!memoryData || !memoryData.metadata.trust_network) return;
    
    const trustList = document.getElementById('trust-list');
    const trustNetwork = memoryData.metadata.trust_network;
    
    if (Object.keys(trustNetwork).length === 0) {
        trustList.innerHTML = '<p style="color: #b9bbbe;">No trust relationships found.</p>';
        return;
    }
    
    // Sort by trust level (highest first)
    const sortedTrust = Object.entries(trustNetwork)
        .sort(([,a], [,b]) => b - a);
    
    const trustHTML = sortedTrust.map(([name, level]) => `
        <div class="trust-item">
            <span>${name}</span>
            <span class="trust-level ${getTrustClass(level)}">${level.toFixed(1)}</span>
        </div>
    `).join('');
    
    trustList.innerHTML = trustHTML;
}

function getTrustClass(level) {
    if (level >= 0.7) return 'high';
    if (level >= 0.3) return 'medium';
    if (level >= 0.0) return 'low';
    return 'negative';
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}

function showError(message) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.innerHTML = `
        <div style="color: #d0021b; text-align: center;">
            <h3>Error</h3>
            <p>${message}</p>
            <p style="margin-top: 20px; color: #b9bbbe;">
                Make sure to run <code>python3 export_graph.py</code> first to generate the data.
            </p>
        </div>
    `;
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}