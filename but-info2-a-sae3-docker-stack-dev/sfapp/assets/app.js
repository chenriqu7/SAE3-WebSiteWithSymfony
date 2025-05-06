import './styles/app.css';

document.addEventListener('DOMContentLoaded', function() {
    // do your setup here
    const url = window.location.href;

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.href === url) {
            link.classList.add('bg-gray-700');
        }

    });

});