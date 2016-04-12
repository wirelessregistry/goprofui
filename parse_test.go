package goprofui

import "testing"

func TestParse(t *testing.T) {
	stack1 := []string{
		"func1",
		"func2",
		"func3",
		"func4",
	}

	stack2 := []string{
		"func1",
		"func2",
		"func3",
		"func5",
	}

	stack3 := []string{
		"func1",
		"func2",
		"func6",
		"func7",
	}

	node := &Node{
		Name:     "root",
		Value:    0,
		Children: make(map[string]*Node),
	}

	node.Add(stack1, 1)
	node.Add(stack2, 1)
	node.Add(stack3, 1)

	if node.Value != 3 {
		t.Error("Root node should have a value of 3, found", node.Value)
	}

	if node.Children["func1"].Value != 3 {
		t.Error("func1 node should have a value of 3, found", node.Children["func1"].Value)
	}

	func3 := node.Children["func1"].Children["func2"].Children["func3"]
	if func3.Value != 2 {
		t.Error("func3 node should have a value of 2, found", func3.Value)
	}

	func6 := node.Children["func1"].Children["func2"].Children["func6"]
	if func6.Value != 1 {
		t.Error("func6 node should have a value of 1, found", func6.Value)
	}

}
