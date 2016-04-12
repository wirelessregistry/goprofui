package goprofui

import (
	"encoding/json"
)

// Used to construct the d3 flame graph representation
type Node struct {
	Name     string
	Value    int64
	Children map[string]*Node
}

// Add will add a folded stack of functions to the node. Based on the stack
// convert node script which builds data for the d3 flame graph.
func (n *Node) Add(funcs []string, value int64) {
	n.Value += value

	if len(funcs) > 0 {
		var child *Node
		head := funcs[0]

		child, _ = n.Children[head]
		if child == nil {
			child = &Node{
				Name:     head,
				Value:    0,
				Children: make(map[string]*Node),
			}

			n.Children[head] = child
		}

		funcs = funcs[1:]
		child.Add(funcs, value)
	}
}

// MarshalText will return JSON data of the node tree in the format required by
// the D3 flame graph. Note that the D3 library wants arrays of children.
func (n *Node) MarshalText() ([]byte, error) {
	mapped := n.formatForD3()

	return json.Marshal(mapped)
}

func (n *Node) formatForD3() map[string]interface{} {
	obj := make(map[string]interface{})
	children := make([]map[string]interface{}, 0)

	for _, child := range n.Children {
		mapped := child.formatForD3()
		children = append(children, mapped)
	}

	obj["name"] = n.Name
	obj["value"] = n.Value
	obj["children"] = children

	return obj
}
