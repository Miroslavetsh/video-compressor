const readline = require("readline");

const MONTHS = {
  1: 0,
  "01": 0,
  january: 0,
  jan: 0,
  январь: 0,
  января: 0,
  2: 1,
  "02": 1,
  february: 1,
  feb: 1,
  февраль: 1,
  февраля: 1,
  3: 2,
  "03": 2,
  march: 2,
  mar: 2,
  март: 2,
  марта: 2,
  4: 3,
  "04": 3,
  april: 3,
  apr: 3,
  апрель: 3,
  апреля: 3,
  5: 4,
  "05": 4,
  may: 4,
  май: 4,
  мая: 4,
  6: 5,
  "06": 5,
  june: 5,
  jun: 5,
  июнь: 5,
  июня: 5,
  7: 6,
  "07": 6,
  july: 6,
  jul: 6,
  июль: 6,
  июля: 6,
  8: 7,
  "08": 7,
  august: 7,
  aug: 7,
  август: 7,
  августа: 7,
  9: 8,
  "09": 8,
  september: 8,
  sep: 8,
  sept: 8,
  сентябрь: 8,
  сентября: 8,
  10: 9,
  october: 9,
  oct: 9,
  октябрь: 9,
  октября: 9,
  11: 10,
  november: 10,
  nov: 10,
  ноябрь: 10,
  ноября: 10,
  12: 11,
  december: 11,
  dec: 11,
  декабрь: 11,
  декабря: 11,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function floorTo2(value) {
  return Math.floor(value * 100) / 100;
}

function countWorkingDays(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const weekDay = new Date(year, monthIndex, day).getDay();
    if (weekDay !== 0 && weekDay !== 6) {
      workingDays += 1;
    }
  }

  return workingDays;
}

function parseMonth(input) {
  const normalized = input.toLowerCase();
  return MONTHS[normalized];
}

async function main() {
  try {
    console.log("=== Расчет зарплаты за месяц ===");

    const args = process.argv.slice(2);
    let monthInput;
    let yearInput;
    let workedDaysInput;
    let salaryInput;

    if (args.length >= 4) {
      [monthInput, yearInput, workedDaysInput, salaryInput] = args;
    } else {
      monthInput = await ask("Месяц (например: март или 3): ");
      yearInput = await ask("Год (Enter = текущий): ");
      workedDaysInput = await ask("Сколько дней отработано: ");
      salaryInput = await ask("Месячная ставка: ");
    }

    const monthIndex = parseMonth(monthInput);
    if (monthIndex === undefined) {
      throw new Error("Не удалось распознать месяц.");
    }

    const currentYear = new Date().getFullYear();
    const year = !yearInput ? currentYear : Number(yearInput);
    if (!Number.isInteger(year) || year < 1970) {
      throw new Error("Год должен быть целым числом (например 2026).");
    }

    const workedDays = Number(String(workedDaysInput).replace(",", "."));
    if (!Number.isFinite(workedDays) || workedDays < 0) {
      throw new Error("Отработанные дни должны быть числом >= 0.");
    }

    const monthlySalaryRaw = Number(String(salaryInput).replace(",", "."));
    if (!Number.isFinite(monthlySalaryRaw) || monthlySalaryRaw < 0) {
      throw new Error("Ставка должна быть числом >= 0.");
    }

    const monthlySalary = floorTo2(monthlySalaryRaw);
    const allWorkingDays = countWorkingDays(year, monthIndex);

    if (workedDays > allWorkingDays) {
      throw new Error(
        `Отработанные дни (${workedDays}) больше рабочих дней в месяце (${allWorkingDays}).`,
      );
    }

    const result = floorTo2((workedDays / allWorkingDays) * monthlySalary);

    console.log("\nРезультат:");
    console.log(`- Рабочих дней в месяце: ${allWorkingDays}`);
    console.log(`- Год: ${year}`);
    console.log(`- Месяц: ${monthInput}`);
    console.log(`- Отработано дней: ${workedDays}`);
    console.log(`- Ставка (floor до 2 знаков): ${monthlySalary.toFixed(2)}`);
    console.log(`- К выплате: ${result.toFixed(2)}`);
  } catch (error) {
    console.error(`\nОшибка: ${error.message}`);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
