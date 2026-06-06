document.addEventListener('click', function (event) {
    const header = event.target.closest('.card-header');
    if (!header) return;

    const body = header.parentElement.querySelector('.card-body-collapse');
    if (body) {
        body.classList.toggle('open');
    }
});