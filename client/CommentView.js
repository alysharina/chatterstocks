// contain feed with comments about stock
function CommentView() {
  return React.createElement(
    "div",
    { id: "comment-view" },
    React.createElement(Comment, null)
  );
}