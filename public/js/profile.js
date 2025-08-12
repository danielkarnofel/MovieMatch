function toggleEditForm(id) {
    const form = document.getElementById(`edit-form-${id}`);
    
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "flex";
    } else {
        form.style.display = "none";
    }
}