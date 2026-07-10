use technique::sum;

#[test]
fn sums() {
    assert_eq!(sum(&[1, 2, 3]), 6);
    assert_eq!(sum(&[]), 0);
}
