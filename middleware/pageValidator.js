export default function({ redirect }) {
  redirect("");

  if (localStorage.swipe_id) {
    redirect("/dtr");
  } else {
    redirect("");
  }
}
