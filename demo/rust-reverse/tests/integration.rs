use technique::reverse_string;

#[test]
fn reverses() {
    assert_eq!(reverse_string("abc"), "cba");
    assert_eq!(reverse_string(""), "");
}
