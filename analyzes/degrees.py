import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.pyplot import figure
import json

f = open('../data/www_harvard_edu.json')
data = json.load(f)
f.close()

G = nx.DiGraph()
count = 0
for vertex in data:
    tuples = []
    for edge in vertex['outDegrees']:
        G.add_edges_from([(vertex['href'], edge if 'http' in edge else 'https://harward.edu' + edge)])

# nx.write_gml(G, "site.gml")
# pr = nx.pagerank(G, 0.5)

warshal = nx.floyd_warshall(G, 0.5)
print(warshal)
# with open('json_data.json', 'w') as outfile:
#     json.dump(pr, outfile)
# draw in pdf
# def save_graph(graph, file_name):
#     plt.figure(num=None, figsize=(20, 20), dpi=80)
#     plt.axis('off')
#     fig = plt.figure(1)
#     pos = nx.spring_layout(graph)
#     nx.draw_networkx_nodes(graph,pos)
#     nx.draw_networkx_edges(graph,pos)
#     nx.draw_networkx_labels(graph,pos)
#
#     cut = 1.00
#     xmax = cut * max(xx for xx, yy in pos.values())
#     ymax = cut * max(yy for xx, yy in pos.values())
#     plt.xlim(0, xmax)
#     plt.ylim(0, ymax)
#
#     plt.savefig(file_name,bbox_inches="tight")
#     pylab.close()
#     del fig
#
# save_graph(G,"my_graph.pdf")

# draw with nx
# figure(figsize=(10, 8))
# nx.draw(G, node_size=15)

# degree_sequence = sorted([d for n, d in G.degree()], reverse=True)
# dmax = max(degree_sequence)
#
# fig = plt.figure("Degree of a random graph", figsize=(8, 8))
# # Create a gridspec for adding subplots of different sizes
# axgrid = fig.add_gridspec(5, 4)
#
#
# fig.tight_layout()
# plt.show()


def floydWarshal(G):
    nx.floyd_warshall(G, 1)