const textarea = document.getElementById("notepad");
const statusLeft = document.getElementById("status-left");
const lineCountEl = document.getElementById("line-count");
const startBtn = document.getElementById("start-btn");

let tickets = [];
let animationTimer = null;

function generateTickets(count = 150) {
    tickets = [];
    for (let i = 1; i <= count; i++) {
        tickets.push(i);
    }
}

function setTextarea(lines) {
    textarea.value = lines.join("\n");
    lineCountEl.textContent = lines.length;
    textarea.scrollTop = textarea.scrollHeight;
}

function resetView() {
    statusLeft.textContent = "Розыгрыш билетов...";
    generateTickets();
    setTextarea(tickets.map((n) => `Билет № ${n}`));
}

function startAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }

    generateTickets();

    const winnerIndex = Math.floor(Math.random() * tickets.length);
    const winner = tickets[winnerIndex];

    let step = 0;
    const totalSteps = 80;

    statusLeft.textContent = "Идёт розыгрыш...";
    startBtn.disabled = true;

    animationTimer = setInterval(() => {
        step += 1;

        const offset = Math.max(0, step - 20);
        const visible = tickets.slice(offset, offset + 20).map((n) => `Билет № ${n}`);

        if (step < totalSteps - 10) {
            setTextarea(visible);
        } else if (step < totalSteps) {
            const mix = visible.map((n) => `> ${n}`);
            setTextarea(mix);
        } else {
            clearInterval(animationTimer);
            animationTimer = null;

            const finalLines = [
                "==== РЕЗУЛЬТАТ РОЗЫГРЫША ====",
                "",
                `Всего билетов: ${tickets.length}`,
                "",
                `ПОБЕДИТЕЛЬ: Билет № ${winner}`,
                "==============================",
            ];

            setTextarea(finalLines);
            statusLeft.textContent = "Розыгрыш завершён";
            startBtn.disabled = false;
        }
    }, 60);
}

startBtn.addEventListener("click", startAnimation);

resetView();
