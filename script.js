document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.glass-card');
    const text = document.querySelector('.hero-text');

    // Subtle parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const moveX = (clientX - innerWidth / 2) / 25;
        const moveY = (clientY - innerHeight / 2) / 25;

        card.style.transform = `rotateY(${moveX}deg) rotateX(${-moveY}deg) translateY(-5px)`;
    });

    // Reset transform when mouse leaves (optional, but smoother with CSS transitions)
    document.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg) translateY(0px)`;
    });
});
