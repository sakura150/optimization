// Существующий код из первой лабораторной работы

const functions = {
    sphere: {
        name: 'Сфера',
        f: (x, y) => x*x + y*y,
        gradX: (x, y) => 2*x,
        gradY: (x, y) => 2*y,
        xRange: [-5, 5],
        yRange: [-5, 5]
    },
    rastrigin: {
        name: 'Растригина',
        f: (x, y) => 20 + x*x + y*y - 10*(Math.cos(2*Math.PI*x) + Math.cos(2*Math.PI*y)),
        gradX: (x, y) => 2*x + 20*Math.PI*Math.sin(2*Math.PI*x),
        gradY: (x, y) => 2*y + 20*Math.PI*Math.sin(2*Math.PI*y),
        xRange: [-5.12, 5.12],
        yRange: [-5.12, 5.12]
    },
    himmelblau: {
        name: 'Химмельблау',
        f: (x, y) => Math.pow(x*x + y - 11, 2) + Math.pow(x + y*y - 7, 2),
        gradX: (x, y) => 4*x*(x*x + y - 11) + 2*(x + y*y - 7),
        gradY: (x, y) => 2*(x*x + y - 11) + 4*y*(x + y*y - 7),
        xRange: [-5, 5],
        yRange: [-5, 5]
    },
    rosenbrock: {
        name: 'Розенброка',
        f: (x, y) => 100*Math.pow(y - x*x, 2) + Math.pow(1 - x, 2),
        gradX: (x, y) => -400*x*(y - x*x) - 2*(1 - x),
        gradY: (x, y) => 200*(y - x*x),
        xRange: [-2, 2],
        yRange: [-1, 3]
    },
    bukin: {
        name: 'Букина',
        f: (x, y) => 100*Math.sqrt(Math.abs(y - 0.01*x*x)) + 0.01*Math.abs(x + 10),
        gradX: (x, y) => {
            const eps = 1e-5;
            return (functions.bukin.f(x + eps, y) - functions.bukin.f(x - eps, y)) / (2*eps);
        },
        gradY: (x, y) => {
            const eps = 1e-5;
            return (functions.bukin.f(x, y + eps) - functions.bukin.f(x, y - eps)) / (2*eps);
        },
        xRange: [-15, -5],
        yRange: [-3, 3]
    }
};

let isRunning = false;
let stopRequested = false;
let pathData = [];

// Функция для создания поверхности
function createSurface(func, xRange, yRange, points = 40) {
    const x = [];
    const y = [];
    const z = [];
    
    const xStep = (xRange[1] - xRange[0]) / points;
    const yStep = (yRange[1] - yRange[0]) / points;
    
    for (let i = 0; i <= points; i++) {
        const xi = xRange[0] + i * xStep;
        x.push(xi);
        const row = [];
        for (let j = 0; j <= points; j++) {
            const yj = yRange[0] + j * yStep;
            if (i === 0) y.push(yj);
            row.push(func(xi, yj));
        }
        z.push(row);
    }
    
    return {x, y, z};
}

// Функция для обновления графика
function updatePlot(func, path, iteration) {
    const funcName = document.getElementById('function-select').value;
    const funcData = functions[funcName];
    
    const xRangeStr = document.getElementById('x-axis-range').value.split(',');
    const yRangeStr = document.getElementById('y-axis-range').value.split(',');
    const zScale = parseFloat(document.getElementById('z-scale').value);
    const showGrid = document.getElementById('show-grid').checked;
    
    const xRange = [parseFloat(xRangeStr[0]), parseFloat(xRangeStr[1])];
    const yRange = [parseFloat(yRangeStr[0]), parseFloat(yRangeStr[1])];
    
    const surface = createSurface(func, xRange, yRange, 40);
    
    // Пересчитываем Z для всех точек пути
    const correctedPath = path.map(p => ({
        x: p.x,
        y: p.y,
        z: func(p.x, p.y)
    }));
    
    const pathX = correctedPath.map(p => p.x);
    const pathY = correctedPath.map(p => p.y);
    const pathZ = correctedPath.map(p => p.z);
    
    const lastPoint = correctedPath[correctedPath.length - 1];
    document.getElementById('current-point').innerHTML = 
        `x: ${lastPoint.x.toFixed(3)} | y: ${lastPoint.y.toFixed(3)} | z: ${lastPoint.z.toFixed(6)}`;
    
    const colorscale = 'Viridis';
    
    const data = [
        {
            type: 'surface',
            x: surface.x,
            y: surface.y,
            z: surface.z,
            colorscale: colorscale,
            opacity: 0.8,
            showscale: false,
            contours: {
                z: {
                    show: true,
                    usecolormap: true,
                    project: {z: true}
                }
            }
        },
        {
            type: 'scatter3d',
            x: pathX,
            y: pathY,
            z: pathZ,
            mode: 'lines+markers',
            line: {
                color: 'red',
                width: 3
            },
            marker: {
                color: 'red',
                size: 2
            },
            showlegend: false
        },
        {
            type: 'scatter3d',
            x: [pathX[pathX.length - 1]],
            y: [pathY[pathY.length - 1]],
            z: [pathZ[pathZ.length - 1]],
            mode: 'markers',
            marker: {
                color: 'yellow',
                size: 6,
                symbol: 'circle',
                line: {
                    color: 'black',
                    width: 1
                }
            },
            showlegend: false
        }
    ];
    
    const layout = {
        title: {
            text: `${funcData.name} - Итерация ${iteration}`,
            font: { size: 11 }
        },
        scene: {
            xaxis: { 
                title: 'X', 
                range: xRange,
                showgrid: showGrid,
                gridcolor: 'rgba(128,128,128,0.2)',
                showbackground: true,
                backgroundcolor: 'rgb(240,240,240)',
                titlefont: { size: 9 }
            },
            yaxis: { 
                title: 'Y', 
                range: yRange,
                showgrid: showGrid,
                gridcolor: 'rgba(128,128,128,0.2)',
                showbackground: true,
                backgroundcolor: 'rgb(240,240,240)',
                titlefont: { size: 9 }
            },
            zaxis: { 
                title: 'f', 
                range: [0, zScale],
                showgrid: showGrid,
                gridcolor: 'rgba(128,128,128,0.2)',
                showbackground: true,
                backgroundcolor: 'rgb(240,240,240)',
                titlefont: { size: 9 }
            },
            camera: {
                eye: { x: 1.8, y: 1.8, z: 1.5 }
            }
        },
        showlegend: false,
        margin: { l: 0, r: 0, b: 0, t: 25 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
    };
    
    Plotly.newPlot('plot', data, layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Функция для обновления списка итераций
function updateIterations(iterations, currentIdx) {
    const container = document.getElementById('iterations');
    container.innerHTML = '';
    
    const startIdx = Math.max(0, iterations.length - 30);
    for (let idx = startIdx; idx < iterations.length; idx++) {
        const iter = iterations[idx];
        const div = document.createElement('div');
        div.className = `iteration-item ${idx === currentIdx ? 'current' : ''}`;
        div.textContent = `${idx}: f(${iter.x.toFixed(3)}; ${iter.y.toFixed(3)}) = ${iter.z.toFixed(6)}`;
        container.appendChild(div);
    }
}

// Основной алгоритм градиентного спуска
async function gradientDescent() {
    const funcName = document.getElementById('function-select').value;
    const func = functions[funcName].f;
    const gradX = functions[funcName].gradX;
    const gradY = functions[funcName].gradY;
    
    let x = parseFloat(document.getElementById('start-x').value);
    let y = parseFloat(document.getElementById('start-y').value);
    const stepSize = parseFloat(document.getElementById('step-size').value);
    const maxIter = parseInt(document.getElementById('max-iter').value);
    const delay = parseFloat(document.getElementById('delay').value) * 1000;
    
    const epsilon1 = 0.01;
    const epsilon2 = 0.001;
    
    pathData = [{x, y, z: func(x, y)}];
    updatePlot(func, pathData, 0);
    updateIterations(pathData, 0);
    
    let prevX, prevY;
    let prevSatisfied = false;
    
    for (let k = 0; k < maxIter && isRunning && !stopRequested; k++) {
        const gx = gradX(x, y);
        const gy = gradY(x, y);
        
        const gradNorm = Math.sqrt(gx*gx + gy*gy);
        if (gradNorm < epsilon1) break;
        
        prevX = x;
        prevY = y;
        
        let newX = x - stepSize * gx;
        let newY = y - stepSize * gy;
        let newZ = func(newX, newY);
        let currentStep = stepSize;
        
        while (newZ >= func(x, y) && currentStep > 0.001) {
            currentStep /= 2;
            newX = x - currentStep * gx;
            newY = y - currentStep * gy;
            newZ = func(newX, newY);
        }
        
        x = newX;
        y = newY;
        
        pathData.push({x, y, z: newZ});
        
        const dx = Math.abs(x - prevX);
        const dy = Math.abs(y - prevY);
        const dz = Math.abs(newZ - func(prevX, prevY));
        
        const currentSatisfied = (dx < epsilon2 && dy < epsilon2 && dz < epsilon2);
        if (currentSatisfied && prevSatisfied) break;
        prevSatisfied = currentSatisfied;
        
        updatePlot(func, pathData, k + 1);
        updateIterations(pathData, k + 1);
        
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    document.getElementById('final-result').style.display = 'block';
    document.getElementById('final-result').innerHTML = 
        `Результат: f(${x.toFixed(5)}; ${y.toFixed(5)}) = ${func(x, y).toFixed(6)}`;
    
    isRunning = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
}

// Обработчики событий для первой лабораторной
document.getElementById('start-btn').addEventListener('click', function() {
    isRunning = true;
    stopRequested = false;
    this.disabled = true;
    document.getElementById('stop-btn').disabled = false;
    document.getElementById('final-result').style.display = 'none';
    
    gradientDescent();
});

document.getElementById('stop-btn').addEventListener('click', function() {
    stopRequested = true;
    isRunning = false;
    this.disabled = true;
    document.getElementById('start-btn').disabled = false;
});

// Инициализация первой лабораторной
(function init() {
    const funcName = document.getElementById('function-select').value;
    const func = functions[funcName].f;
    const x = parseFloat(document.getElementById('start-x').value);
    const y = parseFloat(document.getElementById('start-y').value);
    
    pathData = [{x, y, z: func(x, y)}];
    updatePlot(func, pathData, 0);
    updateIterations(pathData, 0);
    
    document.getElementById('current-point').innerHTML = 
        `x: ${x.toFixed(3)} | y: ${y.toFixed(3)} | z: ${func(x, y).toFixed(6)}`;
})();

document.getElementById('function-select').addEventListener('change', function() {
    const funcName = this.value;
    const funcData = functions[funcName];
    
    document.getElementById('x-axis-range').value = funcData.xRange.join(',');
    document.getElementById('y-axis-range').value = funcData.yRange.join(',');
    
    init();
});

// ========== ЛАБОРАТОРНАЯ РАБОТА №2: КВАДРАТИЧНОЕ ПРОГРАММИРОВАНИЕ ==========
// УНИВЕРСАЛЬНАЯ РЕАЛИЗАЦИЯ АЛГОРИТМА ИЗ МЕТОДИЧКИ

// ... (весь ваш предыдущий код до QuadraticProgrammingSolver остается без изменений) ...

class QuadraticProgrammingSolver {
    constructor() {
        this.reset();
    }
    
    reset() {
        // Исходные данные задачи
        this.Q = [];           // Матрица квадратичных коэффициентов (для производных)
        this.c = [];           // Вектор линейных коэффициентов
        this.A = [];           // Матрица ограничений
        this.b = [];           // Вектор правых частей
        this.n = 2;            // Количество переменных (x₁, x₂)
        this.m = 0;            // Количество ограничений
        
        // Система условий Куна-Таккера
        this.lagrangeFunction = '';
        this.kktConditions = [];
        this.extendedSystem = [];
        this.extendedCoeffs = [];  // Числовые коэффициенты расширенной системы
        this.extendedRHS = [];      // Правые части
        
        // Данные для симплекс-метода
        this.simplex = null;
        this.solution = null;
        this.lambda = [];
        this.fOptimal = null;
        this.status = 'unsolved';
        this.variableNames = [];
    }
    
    // Загрузка данных из формы
    loadFromForm() {
        // Квадратичные коэффициенты исходной функции f(x) = q11·x₁² + q12·x₁x₂ + q22·x₂² + c1·x₁ + c2·x₂
        const q11 = parseFloat(document.getElementById('q11').value) || 0;
        const q12 = parseFloat(document.getElementById('q12').value) || 0;
        const q22 = parseFloat(document.getElementById('q22').value) || 0;
        
        // Линейные коэффициенты
        const c1 = parseFloat(document.getElementById('c1').value) || 0;
        const c2 = parseFloat(document.getElementById('c2').value) || 0;
        
        // Для условий Куна-Таккера нужны производные:
        // ∂f/∂x₁ = 2·q11·x₁ + q12·x₂ + c₁
        // ∂f/∂x₂ = q12·x₁ + 2·q22·x₂ + c₂
        this.Q = [
            [2 * q11, q12],
            [q12, 2 * q22]
        ];
        this.c = [c1, c2];
        
        // Загрузка ограничений
        this.A = [];
        this.b = [];
        
        const constraintRows = document.querySelectorAll('.constraint-row');
        this.m = constraintRows.length;
        
        constraintRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
                const a1 = parseFloat(inputs[0].value) || 0;
                const a2 = parseFloat(inputs[1].value) || 0;
                const b = parseFloat(inputs[2].value) || 0;
                this.A.push([a1, a2]);
                this.b.push(b);
            }
        });
    }
    
    // ШАГ 1: Преобразование ограничений к виду g(x) ≤ 0
    transformConstraints() {
        let result = 'Ограничения приведены к виду g(x) ≤ 0:\n';
        for (let i = 0; i < this.m; i++) {
            result += `g${i+1}(x) = ${this.A[i][0]}x₁ + ${this.A[i][1]}x₂ - ${this.b[i]} ≤ 0\n`;
        }
        result += 'x₁ ≥ 0, x₂ ≥ 0 (по условию задачи)';
        return result;
    }
    
    // ШАГ 2: Составление функции Лагранжа
    buildLagrangeFunction() {
        const q11 = parseFloat(document.getElementById('q11').value) || 0;
        const q12 = parseFloat(document.getElementById('q12').value) || 0;
        const q22 = parseFloat(document.getElementById('q22').value) || 0;
        const c1 = parseFloat(document.getElementById('c1').value) || 0;
        const c2 = parseFloat(document.getElementById('c2').value) || 0;
        
        let f = `${q11}x₁²`;
        if (q12 > 0) f += ` + ${q12}x₁x₂`;
        else if (q12 < 0) f += ` - ${Math.abs(q12)}x₁x₂`;
        
        if (q22 > 0) f += ` + ${q22}x₂²`;
        else if (q22 < 0) f += ` - ${Math.abs(q22)}x₂²`;
        
        if (c1 > 0) f += ` + ${c1}x₁`;
        else if (c1 < 0) f += ` - ${Math.abs(c1)}x₁`;
        
        if (c2 > 0) f += ` + ${c2}x₂`;
        else if (c2 < 0) f += ` - ${Math.abs(c2)}x₂`;
        
        let lagrange = `L(x,λ) = ${f}`;
        
        for (let i = 0; i < this.m; i++) {
            lagrange += ` + λ${i+1}·(${this.A[i][0]}x₁ + ${this.A[i][1]}x₂ - ${this.b[i]})`;
        }
        
        this.lagrangeFunction = lagrange;
        return lagrange;
    }
    
    // ШАГ 3: Нахождение частных производных и условий Куна-Таккера
    buildKKTConditions() {
        this.kktConditions = [];
        
        // ∂L/∂x₁
        let gradX1 = `∂L/∂x₁ = ${this.Q[0][0]}x₁`;
        if (this.Q[0][1] > 0) gradX1 += ` + ${this.Q[0][1]}x₂`;
        else if (this.Q[0][1] < 0) gradX1 += ` - ${Math.abs(this.Q[0][1])}x₂`;
        
        if (this.c[0] > 0) gradX1 += ` + ${this.c[0]}`;
        else if (this.c[0] < 0) gradX1 += ` - ${Math.abs(this.c[0])}`;
        
        for (let i = 0; i < this.m; i++) {
            if (this.A[i][0] > 0) gradX1 += ` + λ${i+1}·${this.A[i][0]}`;
            else if (this.A[i][0] < 0) gradX1 += ` - λ${i+1}·${Math.abs(this.A[i][0])}`;
        }
        gradX1 += ` ≥ 0, x₁ ≥ 0, x₁·∂L/∂x₁ = 0`;
        this.kktConditions.push(gradX1);
        
        // ∂L/∂x₂
        let gradX2 = `∂L/∂x₂ = `;
        if (this.Q[1][0] > 0) gradX2 += `${this.Q[1][0]}x₁ + `;
        else if (this.Q[1][0] < 0) gradX2 += `-${Math.abs(this.Q[1][0])}x₁ + `;
        
        if (this.Q[1][1] > 0) gradX2 += `${this.Q[1][1]}x₂`;
        else if (this.Q[1][1] < 0) gradX2 += `-${Math.abs(this.Q[1][1])}x₂`;
        
        if (this.c[1] > 0) gradX2 += ` + ${this.c[1]}`;
        else if (this.c[1] < 0) gradX2 += ` - ${Math.abs(this.c[1])}`;
        
        for (let i = 0; i < this.m; i++) {
            if (this.A[i][1] > 0) gradX2 += ` + λ${i+1}·${this.A[i][1]}`;
            else if (this.A[i][1] < 0) gradX2 += ` - λ${i+1}·${Math.abs(this.A[i][1])}`;
        }
        gradX2 += ` ≥ 0, x₂ ≥ 0, x₂·∂L/∂x₂ = 0`;
        this.kktConditions.push(gradX2);
        
        // ∂L/∂λᵢ
        for (let i = 0; i < this.m; i++) {
            let gradLambda = `∂L/∂λ${i+1} = ${this.A[i][0]}x₁ + ${this.A[i][1]}x₂ - ${this.b[i]} ≤ 0, λ${i+1} ≥ 0, λ${i+1}·∂L/∂λ${i+1} = 0`;
            this.kktConditions.push(gradLambda);
        }
        
        return this.kktConditions;
    }
    
    // ШАГ 4: Введение дополнительных переменных vⱼ и wᵢ
    buildExtendedSystem() {
        this.extendedSystem = [];
        this.extendedCoeffs = [];
        this.extendedRHS = [];
        
        // Определяем имена всех переменных
        this.variableNames = ['x₁', 'x₂'];
        for (let i = 0; i < this.m; i++) {
            this.variableNames.push(`λ${i+1}`);
        }
        this.variableNames.push('v₁', 'v₂');
        for (let i = 0; i < this.m; i++) {
            this.variableNames.push(`w${i+1}`);
        }
        
        // Уравнение 1: ∂L/∂x₁ - v₁ = 0
        let eq1 = '';
        let coeffs1 = new Array(this.variableNames.length).fill(0);
        
        // Коэффициенты при x₁, x₂, λᵢ
        coeffs1[0] = this.Q[0][0];  // x₁
        coeffs1[1] = this.Q[0][1];  // x₂
        
        for (let i = 0; i < this.m; i++) {
            coeffs1[2 + i] = this.A[i][0];  // λᵢ
        }
        
        // Коэффициент при v₁ = -1
        coeffs1[2 + this.m] = -1;  // v₁
        
        eq1 = this.formatEquation(coeffs1, this.variableNames) + ` = ${-this.c[0]}`;
        this.extendedSystem.push(eq1);
        this.extendedCoeffs.push(coeffs1);
        this.extendedRHS.push(-this.c[0]);
        
        // Уравнение 2: ∂L/∂x₂ - v₂ = 0
        let eq2 = '';
        let coeffs2 = new Array(this.variableNames.length).fill(0);
        
        coeffs2[0] = this.Q[1][0];  // x₁
        coeffs2[1] = this.Q[1][1];  // x₂
        
        for (let i = 0; i < this.m; i++) {
            coeffs2[2 + i] = this.A[i][1];  // λᵢ
        }
        
        // Коэффициент при v₂ = -1
        coeffs2[2 + this.m + 1] = -1;  // v₂
        
        eq2 = this.formatEquation(coeffs2, this.variableNames) + ` = ${-this.c[1]}`;
        this.extendedSystem.push(eq2);
        this.extendedCoeffs.push(coeffs2);
        this.extendedRHS.push(-this.c[1]);
        
        // Уравнения для ∂L/∂λᵢ + wᵢ = 0
        for (let i = 0; i < this.m; i++) {
            let eq = '';
            let coeffs = new Array(this.variableNames.length).fill(0);
            
            coeffs[0] = this.A[i][0];  // x₁
            coeffs[1] = this.A[i][1];  // x₂
            
            // Коэффициент при wᵢ = 1
            coeffs[2 + this.m + 2 + i] = 1;  // wᵢ (после v₁, v₂)
            
            eq = this.formatEquation(coeffs, this.variableNames) + ` = ${this.b[i]}`;
            this.extendedSystem.push(eq);
            this.extendedCoeffs.push(coeffs);
            this.extendedRHS.push(this.b[i]);
        }
        
        // Добавляем условия неотрицательности и доп. нежесткости
        this.extendedSystem.push("");
        this.extendedSystem.push("Условия неотрицательности:");
        this.extendedSystem.push("x₁ ≥ 0, x₂ ≥ 0, v₁ ≥ 0, v₂ ≥ 0");
        for (let i = 0; i < this.m; i++) {
            this.extendedSystem.push(`λ${i+1} ≥ 0, w${i+1} ≥ 0`);
        }
        this.extendedSystem.push("");
        this.extendedSystem.push("Условия дополнительной нежесткости:");
        this.extendedSystem.push("x₁·v₁ = 0, x₂·v₂ = 0");
        for (let i = 0; i < this.m; i++) {
            this.extendedSystem.push(`λ${i+1}·w${i+1} = 0`);
        }
        
        return this.extendedSystem;
    }
    
    // Форматирование уравнения для вывода
    formatEquation(coeffs, varNames) {
        let eq = '';
        let first = true;
        
        for (let i = 0; i < coeffs.length; i++) {
            if (Math.abs(coeffs[i]) < 1e-10) continue;
            
            if (first) {
                if (coeffs[i] === 1) eq += varNames[i];
                else if (coeffs[i] === -1) eq += '-' + varNames[i];
                else eq += coeffs[i] + varNames[i];
                first = false;
            } else {
                if (coeffs[i] > 0) {
                    if (coeffs[i] === 1) eq += ' + ' + varNames[i];
                    else eq += ' + ' + coeffs[i] + varNames[i];
                } else {
                    if (coeffs[i] === -1) eq += ' - ' + varNames[i];
                    else eq += ' - ' + Math.abs(coeffs[i]) + varNames[i];
                }
            }
        }
        
        return eq;
    }
    
    // ШАГ 5: Построение вспомогательной задачи ЛП с искусственными переменными
    buildAuxiliaryProblem() {
        let result = [];
        result.push("ШАГ 5: Введение искусственных переменных");
        result.push("");
        
        // Определяем, в какие уравнения нужно ввести искусственные переменные
        // Искусственные переменные вводятся в уравнения, где свободный член не совпадает по знаку
        // с коэффициентами при дополнительных переменных
        
        let artificialVars = [];
        let extendedWithArt = [];
        let artCoeffs = [];
        
        for (let i = 0; i < this.extendedCoeffs.length; i++) {
            let rhs = this.extendedRHS[i];
            
            // Проверяем знак свободного члена
            // Если rhs < 0, нужно ввести искусственную переменную с коэффициентом 1
            // и умножить уравнение на -1
            if (rhs < 0) {
                let artName = `z${artificialVars.length + 1}`;
                artificialVars.push(artName);
                
                // Умножаем уравнение на -1
                let newCoeffs = this.extendedCoeffs[i].map(c => -c);
                let newRHS = -rhs;
                
                // Добавляем искусственную переменную
                let coeffsWithArt = [...newCoeffs, 0];
                coeffsWithArt[coeffsWithArt.length - 1] = 1;
                
                extendedWithArt.push({
                    coeffs: coeffsWithArt,
                    rhs: newRHS,
                    original: `(-1)*(${this.formatEquation(this.extendedCoeffs[i], this.variableNames)} = ${rhs})`
                });
                
                artCoeffs.push(coeffsWithArt);
                
                result.push(`Уравнение ${i+1}: ${this.formatEquation(this.extendedCoeffs[i], this.variableNames)} = ${rhs}`);
                result.push(`  Свободный член отрицательный → умножаем на -1 и вводим ${artName}`);
                result.push(`  ${this.formatEquation(newCoeffs, this.variableNames)} + ${artName} = ${newRHS}`);
                result.push("");
            } else {
                // Просто копируем уравнение
                let coeffsWithArt = [...this.extendedCoeffs[i]];
                for (let a = 0; a < artificialVars.length; a++) {
                    coeffsWithArt.push(0);
                }
                
                extendedWithArt.push({
                    coeffs: coeffsWithArt,
                    rhs: rhs,
                    original: this.formatEquation(this.extendedCoeffs[i], this.variableNames)
                });
                
                artCoeffs.push(coeffsWithArt);
            }
        }
        
        // Добавляем искусственные переменные в список переменных
        let allVarNames = [...this.variableNames, ...artificialVars];
        
        // Строим целевую функцию F(z) = сумма искусственных переменных → min
        let Fcoeffs = new Array(allVarNames.length).fill(0);
        for (let i = 0; i < artificialVars.length; i++) {
            Fcoeffs[this.variableNames.length + i] = 1;
        }
        
        // Выражаем F через остальные переменные (подставляем уравнения)
        // Для этого нужно решить систему относительно искусственных переменных
        // В учебных целях покажем общий вид
        
        result.push("Искусственные переменные: " + artificialVars.join(', '));
        result.push("");
        result.push("Вспомогательная задача ЛП:");
        result.push("F(z) = " + artificialVars.map(v => v).join(' + ') + " → min");
        result.push("");
        result.push("При ограничениях:");
        
        for (let i = 0; i < extendedWithArt.length; i++) {
            let eq = this.formatEquation(extendedWithArt[i].coeffs, allVarNames) + ` = ${extendedWithArt[i].rhs}`;
            result.push(eq);
        }
        
        result.push("");
        result.push(allVarNames.join(', ') + " ≥ 0");
        
        return {
            text: result,
            varNames: allVarNames,
            artificialVars: artificialVars,
            equations: extendedWithArt,
            Fcoeffs: Fcoeffs
        };
    }
    
    // ШАГ 6: Решение вспомогательной задачи симплекс-методом
    solveAuxiliaryProblem() { 
        this.iterations = [];
        
        this.iterations.push("ШАГ 5: Построение вспомогательной задачи ЛП");
      
        
        let auxProblem = this.buildAuxiliaryProblem();
        this.iterations.push(...auxProblem.text);
        
        this.iterations.push("");

        this.iterations.push("ШАГ 6: Решение вспомогательной задачи симплекс-методом");
     
        
        // Создаем экземпляр симплекс-метода
        this.simplex = new SimplexMethod( // Используем глобальный класс SimplexMethod
            auxProblem.varNames,
            auxProblem.artificialVars,
            auxProblem.equations,
            auxProblem.Fcoeffs
        );
        
        // Выводим начальную таблицу
        this.iterations.push("\n Начальная симплекс-таблица:");
        let initialTable = this.simplex.formatTable();
        this.iterations.push(...initialTable);
        
        // Выполняем итерации
        let maxIter = parseInt(document.getElementById('simplex-max-iter').value) || 100;
        let iter = 0;
        
        while (iter < maxIter) {
            let pivotCol = this.simplex.selectPivotColumn();
            if (pivotCol === -1) {
                this.iterations.push("\n Все коэффициенты в строке F ≤ 0. Оптимум достигнут.");
                break;
            }
            
            let pivotRow = this.simplex.selectPivotRow(pivotCol);
            if (pivotRow === -1) {
                this.iterations.push("\n Задача не ограничена.");
                break;
            }
            
            let enteringVar = auxProblem.varNames[pivotCol - 1];
            
            this.iterations.push(`\n ИТЕРАЦИЯ ${iter + 1}`);
            this.iterations.push(`Вводим в базис: ${enteringVar}`);
            this.iterations.push(`Проверка условий дополнительной нежесткости:`);
            
            // Проверяем, можно ли вводить переменную
            if (!this.simplex.canEnterBasis(enteringVar)) {
                this.iterations.push(`   ${enteringVar} нельзя вводить из-за условий доп. нежесткости!`);
                // Ищем другую переменную
                // В реальном алгоритме нужно выбирать другую
                this.iterations.push(`  Пропускаем эту переменную...`);
                
                // Искусственно обнуляем коэффициент в F
                this.simplex.F[pivotCol] = -1e6;
                continue;
            } else {
                this.iterations.push(`   ${enteringVar} можно вводить в базис`);
            }
            
            // Вычисляем отношения
            this.iterations.push(`Вычисляем отношения θ:`);
            for (let i = 0; i < this.simplex.table.length; i++) {
                if (this.simplex.table[i].values[pivotCol] > 1e-6) {
                    let ratio = this.simplex.table[i].values[0] / this.simplex.table[i].values[pivotCol];
                    this.iterations.push(`  θ${i+1} = ${this.simplex.table[i].values[0].toFixed(2)} / ${this.simplex.table[i].values[pivotCol].toFixed(2)} = ${ratio.toFixed(2)}`);
                }
            }
            
            // Выполняем итерацию
            this.simplex.iterate();
            
            // Выводим новую таблицу
            let table = this.simplex.formatTable();
            this.iterations.push(...table);
            
            iter++;
        }
        
        // Получаем решение
        let solution = this.simplex.extractSolution();
        let Fvalue = this.simplex.F[0];
        
        this.iterations.push(`\n Финальное значение F(z) = ${Fvalue.toFixed(4)}`);
        
        // Проверяем, все ли искусственные переменные выведены
        let artificialInBasis = [];
        for (let i = 0; i < this.simplex.basis.length; i++) {
            if (auxProblem.artificialVars.includes(this.simplex.basis[i])) {
                let val = this.simplex.table[i].values[0];
                if (Math.abs(val) > 1e-6) {
                    artificialInBasis.push(`${this.simplex.basis[i]} = ${val.toFixed(4)}`);
                }
            }
        }
        
        if (artificialInBasis.length === 0) {
            this.iterations.push("\n Все искусственные переменные выведены из базиса.");
            this.minFz = 0;
        } else {
            this.iterations.push(`\n Искусственные переменные в базисе: ${artificialInBasis.join(', ')}`);
            this.minFz = Fvalue;
        }
        
        // Извлекаем решение исходной задачи
        this.solution = [
            solution['x₁'] || 0,
            solution['x₂'] || 0
        ];
        
        this.lambda = [];
        for (let i = 1; i <= this.m; i++) {
            this.lambda.push(solution[`λ${i}`] || 0);
        }
        
        // Вычисляем значение целевой функции
        const q11 = parseFloat(document.getElementById('q11').value) || 0;
        const q12 = parseFloat(document.getElementById('q12').value) || 0;
        const q22 = parseFloat(document.getElementById('q22').value) || 0;
        const c1 = parseFloat(document.getElementById('c1').value) || 0;
        const c2 = parseFloat(document.getElementById('c2').value) || 0;
        
        this.fOptimal = q11*this.solution[0]*this.solution[0] + 
                        q12*this.solution[0]*this.solution[1] + 
                        q22*this.solution[1]*this.solution[1] + 
                        c1*this.solution[0] + c2*this.solution[1];
        
        this.status = this.minFz === 0 ? 'solved' : 'infeasible';
        
        return this.iterations;
    }
    
    // ШАГ 7: Анализ результата
    analyzeResult() { // Убрана точка с запятой
        if (this.minFz === 0) {
            return "min F(z) = 0 → все искусственные переменные выведены из базиса. Полученное допустимое базисное решение вспомогательной задачи является допустимым базисным решением системы и, следовательно, решением задачи КП.";
        } else if (this.minFz > 0) {
            return "min F(z) > 0 → среди базисных остались искусственные переменные. Задача КП не имеет решения.";
        } else {
            return "Решение не найдено.";
        }
    }
    
    // Главный метод решения
    solve() { // Убрана точка с запятой
        this.reset();
        this.loadFromForm();
        
        // Шаг 1
        let step1 = this.transformConstraints();
        
        // Шаг 2
        let step2 = this.buildLagrangeFunction();
        
        // Шаг 3
        let step3 = this.buildKKTConditions();
        
        // Шаг 4
        let step4 = this.buildExtendedSystem();
        
        // Шаги 5-6
        let step56 = this.solveAuxiliaryProblem();
        
        // Шаг 7
        let step7 = this.analyzeResult();
        
        return {
            success: this.status === 'solved',
            steps: {
                step1,
                step2,
                step3,
                step4,
                step56,
                step7
            },
            solution: this.solution,
            lambda: this.lambda,
            f: this.fOptimal
        }
    }
}

// ВЫНОСИМ КЛАСС SimplexMethod НА ВЕРХНИЙ УРОВЕНЬ (ВНЕ QuadraticProgrammingSolver)
class SimplexMethod {
    constructor(varNames, artificialVars, equations, Fcoeffs) {
        this.varNames = varNames;
        this.artificialVars = artificialVars;
        this.numVars = varNames.length;
        
        // Построение начальной симплекс-таблицы
        // Формат: каждая строка = { basis: имя, values: [св.член, коэфф1, коэфф2, ...] }
        this.table = [];
        this.basis = [];
        
        for (let i = 0; i < equations.length; i++) {
            // Выбираем базисную переменную
            // Если в уравнении есть искусственная переменная, берём её
            let basisVar = null;
            for (let j = 0; j < this.varNames.length; j++) {
                if (Math.abs(equations[i].coeffs[j] - 1) < 1e-10 && 
                    this.artificialVars.includes(this.varNames[j])) {
                    basisVar = this.varNames[j];
                    break;
                }
            }
            
            // Если нет искусственной, ищем другую с коэффициентом 1
            if (!basisVar) {
                for (let j = 0; j < this.varNames.length; j++) {
                    if (Math.abs(equations[i].coeffs[j] - 1) < 1e-10) {
                        basisVar = this.varNames[j];
                        break;
                    }
                }
            }
            
            // Если всё ещё нет, берём первую с ненулевым коэффициентом
            if (!basisVar) {
                for (let j = 0; j < this.varNames.length; j++) {
                    if (Math.abs(equations[i].coeffs[j]) > 1e-10) {
                        basisVar = this.varNames[j];
                        break;
                    }
                }
            }
            
            this.basis.push(basisVar);
            
            // Строка таблицы: [св.член, коэфф1, ..., коэффN]
            let row = [equations[i].rhs, ...equations[i].coeffs];
            this.table.push({
                basis: basisVar,
                values: row
            });
        }
        
        // Строка целевой функции F (коэффициенты с обратным знаком)
        this.F = [0, ...Fcoeffs.map(c => -c)]; // Для минимизации берём с минусом
        
        // Правила дополнительной нежесткости
        this.complementarityRules = [];
        // x₁ и v₁
        if (this.varNames.includes('x₁') && this.varNames.includes('v₁')) {
            this.complementarityRules.push({ var1: 'x₁', var2: 'v₁' });
        }
        // x₂ и v₂
        if (this.varNames.includes('x₂') && this.varNames.includes('v₂')) {
            this.complementarityRules.push({ var1: 'x₂', var2: 'v₂' });
        }
        // λᵢ и wᵢ
        for (let i = 1; i <= 10; i++) {
            if (this.varNames.includes(`λ${i}`) && this.varNames.includes(`w${i}`)) {
                this.complementarityRules.push({ var1: `λ${i}`, var2: `w${i}` });
            }
        }
        
        this.iteration = 0;
        this.history = [];
    }
    
    // Проверка, можно ли ввести переменную в базис с учетом доп. нежесткости
    canEnterBasis(varName) {
        // Находим пару для этой переменной
        let pair = null;
        for (let rule of this.complementarityRules) {
            if (rule.var1 === varName) pair = rule.var2;
            if (rule.var2 === varName) pair = rule.var1;
        }
        
        if (!pair) return true; // Нет ограничений
        
        // Проверяем, есть ли парная переменная в базисе с положительным значением
        for (let i = 0; i < this.basis.length; i++) {
            if (this.basis[i] === pair) {
                // Парная переменная в базисе, проверяем её значение
                if (this.table[i].values[0] > 1e-6) {
                    return false; // Нельзя вводить, так как парная положительна
                }
            }
        }
        
        return true;
    }
    
    // Выбор ведущего столбца (максимальный положительный коэффициент в F)
    selectPivotColumn() {
        let maxCoef = 0;
        let pivotCol = -1;
        
        for (let j = 1; j < this.F.length; j++) {
            if (this.F[j] > maxCoef + 1e-6) {
                // Проверяем, можно ли вводить эту переменную
                if (j-1 < this.varNames.length && this.canEnterBasis(this.varNames[j-1])) {
                    maxCoef = this.F[j];
                    pivotCol = j;
                }
            }
        }
        
        return pivotCol;
    }
    
    // Выбор ведущей строки (минимальное отношение θ)
    selectPivotRow(pivotCol) {
        let minRatio = Infinity;
        let pivotRow = -1;
        
        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i].values[pivotCol] > 1e-6) {
                let ratio = this.table[i].values[0] / this.table[i].values[pivotCol];
                if (ratio < minRatio - 1e-6) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }
        
        return pivotRow;
    }
    
    // Выполнение одной итерации симплекс-метода
    iterate() {
        let pivotCol = this.selectPivotColumn();
        if (pivotCol === -1) {
            return false; // Оптимум достигнут
        }
        
        let pivotRow = this.selectPivotRow(pivotCol);
        if (pivotRow === -1) {
            throw new Error("Задача не ограничена");
        }
        
        let pivotElement = this.table[pivotRow].values[pivotCol];
        let enteringVar = this.varNames[pivotCol - 1];
        let leavingVar = this.table[pivotRow].basis;
        
        // Запоминаем итерацию
        this.history.push({
            iteration: ++this.iteration,
            entering: enteringVar,
            leaving: leavingVar,
            pivotRow: pivotRow,
            pivotCol: pivotCol,
            pivotElement: pivotElement,
            table: JSON.parse(JSON.stringify(this.table)),
            F: [...this.F]
        });
        
        // Нормируем ведущую строку
        for (let j = 0; j < this.table[pivotRow].values.length; j++) {
            this.table[pivotRow].values[j] /= pivotElement;
        }
        
        // Обновляем остальные строки
        for (let i = 0; i < this.table.length; i++) {
            if (i === pivotRow) continue;
            
            let factor = this.table[i].values[pivotCol];
            if (Math.abs(factor) < 1e-10) continue;
            
            for (let j = 0; j < this.table[i].values.length; j++) {
                this.table[i].values[j] -= factor * this.table[pivotRow].values[j];
            }
        }
        
        // Обновляем целевую функцию
        let factor = this.F[pivotCol];
        if (Math.abs(factor) >= 1e-10) {
            for (let j = 0; j < this.F.length; j++) {
                this.F[j] -= factor * this.table[pivotRow].values[j];
            }
        }
        
        // Обновляем базис
        this.basis[pivotRow] = enteringVar;
        this.table[pivotRow].basis = enteringVar;
        
        return true;
    }
    
    // Решение задачи симплекс-методом
    solve(maxIterations = 100) {
        let iter = 0;
        while (iter < maxIterations) {
            if (!this.iterate()) break;
            iter++;
        }
        
        return {
            optimal: iter < maxIterations,
            solution: this.extractSolution(),
            Fvalue: this.F[0],
            iterations: this.history
        };
    }
    
    // Извлечение решения
    extractSolution() {
        let solution = {};
        
        // Инициализируем все переменные нулями
        for (let varName of this.varNames) {
            solution[varName] = 0;
        }
        
        // Базисные переменные берут свои значения
        for (let i = 0; i < this.basis.length; i++) {
            solution[this.basis[i]] = this.table[i].values[0];
        }
        
        return solution;
    }
    
    // Форматирование таблицы для вывода
    formatTable() {
        let result = [];
        
        // Определяем ширину столбцов
        let colWidth = 6;
        let basisWidth = 6;
        
        // Заголовок
        let header = "┌───────┬──────";
        for (let i = 0; i < this.varNames.length; i++) {
            header += "┬─────";
        }
        header += "┐";
        result.push(header);
        
        // Названия переменных
        let varRow = "│ Базис │ Св.ч ";
        for (let varName of this.varNames) {
            let shortName = varName.length > 3 ? varName.substring(0, 3) : varName;
            varRow += `│ ${shortName.padEnd(3)} `;
        }
        varRow += "│";
        result.push(varRow);
        
        // Разделитель
        let separator = "├───────┼──────";
        for (let i = 0; i < this.varNames.length; i++) {
            separator += "┼─────";
        }
        separator += "┤";
        result.push(separator);
        
        // Строки таблицы
        for (let i = 0; i < this.table.length; i++) {
            let row = `│ ${this.table[i].basis.padEnd(5)} │`;
            row += this.formatValue(this.table[i].values[0], 6);
            for (let j = 1; j < this.table[i].values.length; j++) {
                row += this.formatValue(this.table[i].values[j], 5);
            }
            row += "│";
            result.push(row);
        }
        
        // Разделитель перед F
        let sepF = "├───────┼──────";
        for (let i = 0; i < this.varNames.length; i++) {
            sepF += "┼─────";
        }
        sepF += "┤";
        result.push(sepF);
        
        // Строка F
        let fRow = "│ F     │";
        fRow += this.formatValue(this.F[0], 6);
        for (let j = 1; j < this.F.length; j++) {
            fRow += this.formatValue(this.F[j], 5);
        }
        fRow += "│";
        result.push(fRow);
        
        // Нижняя граница
        let footer = "└───────┴──────";
        for (let i = 0; i < this.varNames.length; i++) {
            footer += "┴─────";
        }
        footer += "┘";
        result.push(footer);
        
        return result;
    }
    
    formatValue(val, width) {
        if (Math.abs(val) < 1e-10) val = 0;
        let str = val.toFixed(2);
        if (val >= 0) str = ' ' + str;
        return str.padStart(width);
    }
}

// Глобальный экземпляр решателя
const qpSolver = new QuadraticProgrammingSolver();

// Функция для открытия вкладок (остаётся без изменений)
function openTab(event, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Добавление нового ограничения
function addConstraint() {
    const container = document.getElementById('constraints-container');
    const constraintCount = container.children.length + 1;
    
    const newRow = document.createElement('div');
    newRow.className = 'constraint-row';
    newRow.innerHTML = `
        <input type="number" id="a${constraintCount}1" value="1" step="0.1"> x₁ + 
        <input type="number" id="a${constraintCount}2" value="1" step="0.1"> x₂ ≤ 
        <input type="number" id="b${constraintCount}" value="1" step="0.1">
        <button class="remove-constraint" onclick="removeConstraint(this)">✕</button>
    `;
    
    container.appendChild(newRow);
}

// Удаление ограничения
function removeConstraint(button) {
    if (document.querySelectorAll('.constraint-row').length > 1) {
        button.closest('.constraint-row').remove();
    }
}

// Обновление отображения результатов
function updateQPResults(result) {
    // Обновляем шаги
    document.getElementById('lagrange-function').innerHTML = result.steps.step2;
    
    let kktHtml = '';
    result.steps.step3.forEach(cond => {
        kktHtml += cond + '<br>';
    });
    document.getElementById('kkt-conditions').innerHTML = kktHtml;
    
    let extHtml = '';
    result.steps.step4.forEach(line => {
        extHtml += line + '<br>';
    });
    document.getElementById('extended-system').innerHTML = extHtml;
    
    let iterHtml = '';
    result.steps.step56.forEach(line => {
        iterHtml += line + '<br>';
    });
    document.getElementById('simplex-iterations').innerHTML = iterHtml;
    
    document.getElementById('auxiliary-problem').innerHTML = result.steps.step7;
    
    if (result.success) {
        document.getElementById('sol-x1').textContent = result.solution[0].toFixed(6);
        document.getElementById('sol-x2').textContent = result.solution[1].toFixed(6);
        document.getElementById('sol-f').textContent = result.f.toFixed(6);
        
        let lambdaText = '';
        result.lambda.forEach((l, i) => {
            lambdaText += `λ${i+1}* = ${l.toFixed(6)}<br>`;
        });
        document.getElementById('sol-lambda').innerHTML = lambdaText;
        
        const statusEl = document.getElementById('qp-status');
        statusEl.textContent = 'Решение найдено ✓';
        statusEl.className = 'qp-status solved';
    } else {
        document.getElementById('sol-x1').textContent = '—';
        document.getElementById('sol-x2').textContent = '—';
        document.getElementById('sol-f').textContent = '—';
        document.getElementById('sol-lambda').innerHTML = '—';
        
        const statusEl = document.getElementById('qp-status');
        statusEl.textContent = 'Решение не найдено ✗';
        statusEl.className = 'qp-status error';
    }
    
    // Визуализируем решение
    visualizeQP(result.success ? result.solution[0] : null, 
                result.success ? result.solution[1] : null);
}

// Визуализация задачи КП (остаётся без изменений)
// Улучшенная визуализация задачи КП
function visualizeQP(x1Opt = null, x2Opt = null) {
    const q11 = parseFloat(document.getElementById('q11').value) || 0;
    const q12 = parseFloat(document.getElementById('q12').value) || 0;
    const q22 = parseFloat(document.getElementById('q22').value) || 0;
    const c1 = parseFloat(document.getElementById('c1').value) || 0;
    const c2 = parseFloat(document.getElementById('c2').value) || 0;
    
    // Расширенный диапазон для лучшей визуализации
    const xMin = -2;
    const xMax = 4;
    const yMin = -2;
    const yMax = 4;
    const points = 100; // Увеличиваем количество точек для гладкости
    
    // Создаем сетку для контурного графика
    const x = [];
    const y = [];
    const z = [];
    
    const xStep = (xMax - xMin) / points;
    const yStep = (yMax - yMin) / points;
    
    for (let i = 0; i <= points; i++) {
        const xi = xMin + i * xStep;
        x.push(xi);
        const row = [];
        for (let j = 0; j <= points; j++) {
            const yj = yMin + j * yStep;
            if (i === 0) y.push(yj);
            // Вычисляем значение целевой функции
            const val = q11*xi*xi + q12*xi*yj + q22*yj*yj + c1*xi + c2*yj;
            row.push(val);
        }
        z.push(row);
    }
    
    // Собираем линии ограничений
    const constraintLines = [];
    const constraintRows = document.querySelectorAll('.constraint-row');
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    
    constraintRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 3) {
            const a1 = parseFloat(inputs[0].value) || 0;
            const a2 = parseFloat(inputs[1].value) || 0;
            const b = parseFloat(inputs[2].value) || 0;
            
            // Создаем линию ограничения a1*x₁ + a2*x₂ = b
            const xLine = [];
            const yLine = [];
            
            if (Math.abs(a2) > 1e-6) {
                // Наклонная или горизонтальная линия
                const t = [xMin, xMax];
                xLine.push(xMin, xMax);
                yLine.push((b - a1*xMin) / a2, (b - a1*xMax) / a2);
            } else if (Math.abs(a1) > 1e-6) {
                // Вертикальная линия
                const xVal = b / a1;
                xLine.push(xVal, xVal);
                yLine.push(yMin, yMax);
            }
            
            constraintLines.push({
                x: xLine,
                y: yLine,
                name: `${a1.toFixed(2)}x₁ + ${a2.toFixed(2)}x₂ = ${b.toFixed(2)}`,
                color: colors[index % colors.length]
            });
        }
    });
    
    // Добавляем линии осей координат
    const axesLines = [
        {
            x: [0, 0],
            y: [yMin, yMax],
            name: 'x₂ = 0',
            color: 'black',
            dash: 'dot'
        },
        {
            x: [xMin, xMax],
            y: [0, 0],
            name: 'x₁ = 0',
            color: 'black',
            dash: 'dot'
        }
    ];
    
    // Формируем данные для графика
    const data = [
        {
            type: 'contour',
            x: x,
            y: y,
            z: z,
            colorscale: 'Viridis',
            contours: {
                coloring: 'fill',
                showlabels: true,
                labelfont: {
                    size: 10,
                    color: 'white'
                }
            },
            colorbar: {
                title: 'f(x)',
                titleside: 'right',
                thickness: 15,
                len: 0.8
            },
            ncontours: 20,
            line: {
                smoothing: 0.8
            }
        }
    ];
    
    // Добавляем линии ограничений
    constraintLines.forEach(line => {
        data.push({
            type: 'scatter',
            x: line.x,
            y: line.y,
            mode: 'lines',
            line: {
                color: line.color,
                width: 3,
                dash: 'solid'
            },
            name: line.name
        });
        
        // Добавляем стрелки направления (где уместно)
        if (Math.abs(line.x[1] - line.x[0]) > 0.1 && Math.abs(line.y[1] - line.y[0]) > 0.1) {
            // Затеняем допустимую область (примерно)
            data.push({
                type: 'scatter',
                x: [line.x[0] + 0.3*(line.x[1]-line.x[0])],
                y: [line.y[0] + 0.3*(line.y[1]-line.y[0])],
                mode: 'text',
                text: ['≤'],
                textfont: {
                    size: 16,
                    color: line.color
                },
                showlegend: false
            });
        }
    });
    
    // Добавляем оси
    axesLines.forEach(line => {
        data.push({
            type: 'scatter',
            x: line.x,
            y: line.y,
            mode: 'lines',
            line: {
                color: line.color,
                width: 1,
                dash: line.dash || 'solid'
            },
            showlegend: false
        });
    });
    
    // Добавляем оптимальную точку
    if (x1Opt !== null && x2Opt !== null) {
        data.push({
            type: 'scatter',
            x: [x1Opt],
            y: [x2Opt],
            mode: 'markers+text',
            marker: {
                color: 'yellow',
                size: 15,
                symbol: 'star',
                line: {
                    color: 'black',
                    width: 2
                }
            },
            text: ['Opt'],
            textposition: 'top center',
            textfont: {
                size: 12,
                color: 'black',
                weight: 'bold'
            },
            name: 'Оптимум'
        });
    }
    
    const layout = {
        title: {
            text: 'Контурный график целевой функции и допустимая область',
            font: { size: 14 }
        },
        xaxis: {
            title: 'x₁',
            range: [xMin, xMax],
            gridcolor: 'lightgray',
            gridwidth: 1,
            zeroline: false,
            showline: true,
            linewidth: 1,
            linecolor: 'black',
            mirror: true,
            tickfont: { size: 11 }
        },
        yaxis: {
            title: 'x₂',
            range: [yMin, yMax],
            gridcolor: 'lightgray',
            gridwidth: 1,
            zeroline: false,
            showline: true,
            linewidth: 1,
            linecolor: 'black',
            mirror: true,
            tickfont: { size: 11 },
            scaleanchor: 'x',
            scaleratio: 1
        },
        showlegend: true,
        legend: {
            x: 1.02,
            y: 1,
            xanchor: 'left',
            font: { size: 10 },
            bgcolor: 'rgba(255,255,255,0.8)'
        },
        margin: {
            l: 60,
            r: 150,
            b: 50,
            t: 50,
            pad: 4
        },
        width: 700,
        height: 600,
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        displaylogo: false
    };
    
    Plotly.newPlot('qp-plot', data, layout, config);
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('solve-qp-btn').addEventListener('click', function() {
        const result = qpSolver.solve();
        updateQPResults(result);
    });
    
    document.getElementById('reset-qp-btn').addEventListener('click', function() {
        qpSolver.reset();
        document.getElementById('lagrange-function').innerHTML = '';
        document.getElementById('kkt-conditions').innerHTML = '';
        document.getElementById('extended-system').innerHTML = '';
        document.getElementById('simplex-iterations').innerHTML = '';
        document.getElementById('auxiliary-problem').innerHTML = '';
        document.getElementById('sol-x1').textContent = '—';
        document.getElementById('sol-x2').textContent = '—';
        document.getElementById('sol-f').textContent = '—';
        document.getElementById('sol-lambda').innerHTML = '—';
        document.getElementById('qp-status').textContent = '';
        document.getElementById('qp-status').className = 'qp-status';
        visualizeQP();
    });
    
    document.getElementById('example-qp-btn').addEventListener('click', function() {
        document.getElementById('q11').value = 2;
        document.getElementById('q12').value = 2;
        document.getElementById('q22').value = 2;
        document.getElementById('c1').value = -4;
        document.getElementById('c2').value = -6;
        
        const container = document.getElementById('constraints-container');
        container.innerHTML = '';
        const newRow = document.createElement('div');
        newRow.className = 'constraint-row';
        newRow.innerHTML = `
            <input type="number" id="a11" value="1" step="0.1"> x₁ + 
            <input type="number" id="a12" value="2" step="0.1"> x₂ ≤ 
            <input type="number" id="b1" value="2" step="0.1">
            <button class="remove-constraint" onclick="removeConstraint(this)" style="display:none;">✕</button>
        `;
        container.appendChild(newRow);
        
        visualizeQP();
    });
    
    visualizeQP();
});