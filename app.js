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
        // Если файл не найден или пустой — оставляем список билетов пустым
        tickets = [];
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

    // Будем проходить по всем билетам, чтобы каждый хотя бы раз попал в "прокрутку"
    let currentIndex = 0;

    statusLeft.textContent = "Идёт розыгрыш...";
    startBtn.disabled = true;

    animationTimer = setInterval(() => {
        if (currentIndex < tickets.length) {
            // Показываем "окно" из 20 строк вокруг текущего билета
            const start = Math.max(0, currentIndex - 19);
            const windowTickets = tickets.slice(start, start + 20);

            const visible = windowTickets.map((n) => {
                // Подсветим текущий билет стрелкой
                if (n === tickets[currentIndex]) {
                    return ` Билет № ${n}`;
                }
                return `  Билет № ${n}`;
            });

            setTextarea(visible);
            currentIndex += 1;
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
