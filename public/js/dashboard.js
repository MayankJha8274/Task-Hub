async function completeTask(id) {
  const res = await fetch(`/tasks/api/${id}/complete?_method=PUT`, {
    method: "POST"
  });

  const data = await res.json();
  if (data.success) location.reload();
}

async function deleteTask(id) {
  const res = await fetch(`/tasks/api/${id}?_method=DELETE`, {
    method: "POST"
  });

  const data = await res.json();
  if (data.success) location.reload();
}

function filterTasks() {
  const filter = document.getElementById("filter").value;
  const items = document.querySelectorAll("#taskList li");

  items.forEach(item => {
    const isCompleted = item.querySelector("span").classList.contains("text-decoration-line-through");

    if (filter === "all") {
      item.style.display = "flex";
    } 
    else if (filter === "completed" && isCompleted) {
      item.style.display = "flex";
    } 
    else if (filter === "pending" && !isCompleted) {
      item.style.display = "flex";
    }
    else {
      item.style.display = "none";
    }
  });
}
