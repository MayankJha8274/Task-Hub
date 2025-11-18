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
