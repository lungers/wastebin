const deleteButton = document.querySelector('.delete');

deleteButton.addEventListener('click', () => {
    const confirmed = confirm(
        'Are you sure you want to delete this paste? You cannot undo this!',
    );

    if (confirmed) {
        fetch(`/delete/${deleteButton.dataset.hash}`, {
            method: 'DELETE',
        }).then(res => {
            if (res.status === 200) {
                location.href = '/';
            } else {
                alert('Failed to delete this paste');
            }
        });
    }
});
