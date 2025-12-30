const textarea = document.getElementById("notepad");
const statusLeft = document.getElementById("status-left");
const lineCountEl = document.getElementById("line-count");
const startBtn = document.getElementById("start-btn");

let tickets = [];
let animationTimer = null;

async function loadTicketsFromFile() {
    try {
        const resp = await fetch("tickets_month_winner_2025-10-01.txt?" + Date.now());
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

    // Будем проходить по списку с адаптивным шагом. Настраиваем так, чтобы
    // общая длительность анимации была порядка 30 секунд даже при большом
    // количестве билетов.
    const targetSteps = 400; // примерно столько кадров хотим максимум
    const step = Math.max(1, Math.ceil(tickets.length / targetSteps));

    let currentIndex = 0;

    statusLeft.textContent = "Идёт розыгрыш...";
    startBtn.disabled = true;

    const intervalMs = 75; // 400 * 75мс ≈ 30 секунд анимации

    animationTimer = setInterval(() => {
        if (currentIndex < tickets.length) {
            // Показываем "окно" из 20 строк вокруг текущего билета
            const start = Math.max(0, currentIndex - 19);
            const windowTickets = tickets.slice(start, start + 20);

            const visible = windowTickets.map((n) => {
                // Подсветим текущий билет стрелкой (это текущий элемент окна)
                if (n === tickets[currentIndex]) {
                    return ` Билет № ${n}`;
                }
                return `  Билет № ${n}`;
            });

            setTextarea(visible);
            currentIndex += step;
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
    }, intervalMs);
}

startBtn.addEventListener("click", startAnimation);

// При загрузке страницы сразу загрузить tickets.txt, подготовить вид и запустить первую анимацию
(async function init() {
    statusLeft.textContent = "Загрузка списка билетов...";
    await loadTicketsFromFile();
    resetView();
    startAnimation();
})();
