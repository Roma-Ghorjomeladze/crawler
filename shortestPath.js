const data = require('./data/www_harvard_edu.json');
const graph = new Map();
let x;
let maxCount;
let adj=[];
  
// Sets maxCount as maximum distance
// from node
function dfsUtil(node,count,visited,adj)
{
    visited[node] = true;
    count++;
       
    let l = adj[node];
    for(let i=0;i<l.length;i++)
    {
        if(!visited[l[i]]){
            if (count >= maxCount) {
                maxCount = count;
                x = l[i];
            }
            dfsUtil(l[i], count, visited, adj);
        }
    }
}
  
// The function to do DFS traversal. It uses
// recursive dfsUtil()
function dfs(node,n,adj)
{
    let visited = new Array(n + 1);
    let count = 0;
    
    // Mark all the vertices as not visited
    for(let i=0;i<visited.length;i++)
    {
        visited[i]=false;
    }
    
    // Increment count by 1 for visited node
    dfsUtil(node, count + 1, visited, adj);
}
  
// Returns diameter of binary tree represented
// as adjacency list.
function diameter(adj,n)
{
    maxCount = Number.MIN_VALUE;
    
    /* DFS from a random node and then see
    farthest node X from it*/
    dfs(1, n, adj);
    
    /* DFS from X and check the farthest node
    from it */
    dfs(x, n, adj);
    
    return maxCount;
}