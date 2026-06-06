document.addEventListener('click', function (event) {
    const header = event.target.closest('.card-header');
    if (!header) return;

    const body = header.parentElement.querySelector('.card-body-collapse');
    if (body) {
        body.classList.toggle('open');
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(data => {
                navPlaceholder.innerHTML = data;
            })
            .catch(error => console.error('Error cargando la navegación:', error));
    }
});