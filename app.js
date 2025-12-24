const textarea = document.getElementById("notepad");
const statusLeft = document.getElementById("status-left");
const lineCountEl = document.getElementById("line-count");
const startBtn = document.getElementById("start-btn");

let tickets = [];
let animationTimer = null;

async function loadTicketsFromFile() {
    try {
        const resp = await fetch("tickets.txt?" + Date.now());
        if (!resp.ok) throw new Error("Failed to load tickets.txt");

        const text = await resp.text();
        const numbers = [];

        text.split(/\r?\n/).forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            trimmed
                .replace(/,/g, " ")
                .split(/\s+/)
                .forEach((token) => {
                    const n = parseInt(token, 10);
                    if (!Number.isNaN(n)) {
                        numbers.push(n);
                    }
                });
        });

        if (numbers.length === 0) {
            throw new Error("No numbers in tickets.txt");
        }

        tickets = numbers;
    } catch (e) {
        console.error("Ticket load error:", e);
        // Fallback: если файла нет или пустой — генерируем стандартный диапазон
        tickets = [];
        for (let i = 1; i <= 150; i++) {
            tickets.push(i);
        }
    }
}

function setTextarea(lines) {
    textarea.value = lines.join("\n");
    lineCountEl.textContent = lines.length;
    textarea.scrollTop = textarea.scrollHeight;
}

function resetView() {
    statusLeft.textContent = "Розыгрыш билетов...";
    if (!tickets || tickets.length === 0) {
        setTextarea(["Нет билетов для розыгрыша"]);
    } else {
        setTextarea(tickets.map((n) => `Билет № ${n}`));
    }
}

function startAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }

    if (!tickets || tickets.length === 0) {
        return;
    }

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

// При загрузке страницы сразу загрузить tickets.txt, подготовить вид и запустить первую анимацию
(async function init() {
    statusLeft.textContent = "Загрузка списка билетов...";
    await loadTicketsFromFile();
    resetView();
    startAnimation();
})();
