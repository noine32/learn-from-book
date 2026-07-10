package technique

import "testing"

func TestReverseString(t *testing.T) {
	if got := ReverseString("abc"); got != "cba" {
		t.Errorf("ReverseString(abc) = %q, want cba", got)
	}
	if got := ReverseString(""); got != "" {
		t.Errorf("ReverseString(empty) = %q, want empty", got)
	}
}
