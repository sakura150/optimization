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

// 333333

class GeneticAlgorithm {
    constructor() {
        this.reset();
    }

    reset() {
        this.populationSize = 50;
        this.generations = 100;
        this.crossoverProbability = 0.8;
        this.mutationProbability = 0.05;
        this.eliteCount = 2;
        this.tournamentSize = 3;
        
        this.xRange = [-2, 2];
        this.yRange = [-1, 3];
        
        this.population = [];
        this.fitness = [];
        this.bestIndividual = null;
        this.bestFitness = Infinity;
        this.history = [];
        this.currentGeneration = 0;
        this.isRunning = false;
        
        this.rosenbrock = (x, y) => {
            if (isNaN(x) || isNaN(y)) return Infinity;
            const result = 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
            return Math.max(0, result);
        };
    }

    initPopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const x = this.xRange[0] + Math.random() * (this.xRange[1] - this.xRange[0]);
            const y = this.yRange[0] + Math.random() * (this.yRange[1] - this.yRange[0]);
            this.population.push({ x: x, y: y });
        }
        this.evaluatePopulation();
    }

    evaluatePopulation() {
        this.fitness = [];
        for (let i = 0; i < this.population.length; i++) {
            const ind = this.population[i];
            if (isNaN(ind.x) || isNaN(ind.y)) {
                this.fitness.push(Infinity);
                continue;
            }
            const f = this.rosenbrock(ind.x, ind.y);
            if (isNaN(f) || f < 0) {
                this.fitness.push(Infinity);
            } else {
                this.fitness.push(f);
            }
            if (this.fitness[i] < this.bestFitness) {
                this.bestFitness = this.fitness[i];
                this.bestIndividual = { x: ind.x, y: ind.y };
            }
        }
    }

    tournamentSelection() {
        let bestIdx = -1;
        let bestFitness = Infinity;
        for (let i = 0; i < this.tournamentSize; i++) {
            const idx = Math.floor(Math.random() * this.populationSize);
            if (this.fitness[idx] < bestFitness) {
                bestFitness = this.fitness[idx];
                bestIdx = idx;
            }
        }
        if (bestIdx === -1) {
            bestIdx = Math.floor(Math.random() * this.populationSize);
        }
        return { x: this.population[bestIdx].x, y: this.population[bestIdx].y };
    }

    crossover(parent1, parent2) {
        if (Math.random() < this.crossoverProbability) {
            const alpha = Math.random();
            const child1 = {
                x: alpha * parent1.x + (1 - alpha) * parent2.x,
                y: alpha * parent1.y + (1 - alpha) * parent2.y
            };
            const child2 = {
                x: (1 - alpha) * parent1.x + alpha * parent2.x,
                y: (1 - alpha) * parent1.y + alpha * parent2.y
            };
            child1.x = Math.max(this.xRange[0], Math.min(this.xRange[1], child1.x));
            child1.y = Math.max(this.yRange[0], Math.min(this.yRange[1], child1.y));
            child2.x = Math.max(this.xRange[0], Math.min(this.xRange[1], child2.x));
            child2.y = Math.max(this.yRange[0], Math.min(this.yRange[1], child2.y));
            return [child1, child2];
        } else {
            return [
                { x: parent1.x, y: parent1.y },
                { x: parent2.x, y: parent2.y }
            ];
        }
    }

    mutate(individual, generation) {
        const newInd = { x: individual.x, y: individual.y };
        const t = generation / Math.max(1, this.generations);
        const mutationStrength = 0.2 * (1 - t);
        
        if (Math.random() < this.mutationProbability) {
            const range = (this.xRange[1] - this.xRange[0]) * mutationStrength;
            newInd.x += (Math.random() - 0.5) * range;
            newInd.x = Math.max(this.xRange[0], Math.min(this.xRange[1], newInd.x));
        }
        if (Math.random() < this.mutationProbability) {
            const range = (this.yRange[1] - this.yRange[0]) * mutationStrength;
            newInd.y += (Math.random() - 0.5) * range;
            newInd.y = Math.max(this.yRange[0], Math.min(this.yRange[1], newInd.y));
        }
        return newInd;
    }

    createNewGeneration() {
        const newPopulation = [];
        const indexed = [];
        for (let i = 0; i < this.population.length; i++) {
            indexed.push({ ind: this.population[i], fit: this.fitness[i] });
        }
        indexed.sort((a, b) => a.fit - b.fit);
        
        for (let i = 0; i < this.eliteCount; i++) {
            newPopulation.push({ x: indexed[i].ind.x, y: indexed[i].ind.y });
        }
        
        while (newPopulation.length < this.populationSize) {
            const parent1 = this.tournamentSelection();
            const parent2 = this.tournamentSelection();
            let [child1, child2] = this.crossover(parent1, parent2);
            child1 = this.mutate(child1, this.currentGeneration);
            child2 = this.mutate(child2, this.currentGeneration);
            newPopulation.push(child1);
            if (newPopulation.length < this.populationSize) {
                newPopulation.push(child2);
            }
        }
        
        this.population = newPopulation;
        this.currentGeneration++;
        this.evaluatePopulation();
    }

    async solve(onIteration, delay = 0) {
        this.reset();
        this.initPopulation();
        this.isRunning = true;
        
        for (let gen = 0; gen < this.generations && this.isRunning; gen++) {
            this.createNewGeneration();
            
            if (onIteration) {
                onIteration({
                    generation: this.currentGeneration,
                    bestFitness: this.bestFitness,
                    bestIndividual: this.bestIndividual,
                    population: this.population,
                    fitness: this.fitness
                });
            }
            
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return {
            solution: this.bestIndividual,
            fitness: this.bestFitness,
            history: this.history
        };
    }

    stop() {
        this.isRunning = false;
    }
}

let gaSolver = null;
let gaRunning = false;

function createGASurface(xRange, yRange, points = 50) {
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
            let val = 100 * Math.pow(yj - xi * xi, 2) + Math.pow(1 - xi, 2);
            if (isNaN(val) || val > 100) val = 100;
            row.push(val);
        }
        z.push(row);
    }
    
    return { x, y, z };
}

async function startGA() {
    console.log("startGA called");
    
    if (gaRunning) {
        console.log("GA already running");
        return;
    }
    
    const populationSize = parseInt(document.getElementById('ga-population-size').value) || 50;
    const generations = parseInt(document.getElementById('ga-generations').value) || 100;
    const crossoverProb = parseFloat(document.getElementById('ga-crossover-prob').value) || 0.8;
    const mutationProb = parseFloat(document.getElementById('ga-mutation-prob').value) || 0.05;
    const tournamentSize = parseInt(document.getElementById('ga-tournament-size').value) || 3;
    const eliteCount = parseInt(document.getElementById('ga-elite-count').value) || 2;
    const xMin = parseFloat(document.getElementById('ga-x-min').value) || -2;
    const xMax = parseFloat(document.getElementById('ga-x-max').value) || 2;
    const yMin = parseFloat(document.getElementById('ga-y-min').value) || -1;
    const yMax = parseFloat(document.getElementById('ga-y-max').value) || 3;
    const delay = parseInt(document.getElementById('ga-delay').value) || 100;
    
    console.log("Parameters:", { populationSize, generations, crossoverProb, mutationProb, delay });
    
    gaSolver = new GeneticAlgorithm();
    gaSolver.populationSize = populationSize;
    gaSolver.generations = generations;
    gaSolver.crossoverProbability = crossoverProb;
    gaSolver.mutationProbability = mutationProb;
    gaSolver.tournamentSize = tournamentSize;
    gaSolver.eliteCount = eliteCount;
    gaSolver.xRange = [xMin, xMax];
    gaSolver.yRange = [yMin, yMax];
    
    document.getElementById('ga-start-btn').disabled = true;
    document.getElementById('ga-stop-btn').disabled = false;
    document.getElementById('ga-reset-btn').disabled = true;
    
    const logDiv = document.getElementById('ga-log');
    logDiv.innerHTML = '';
    logDiv.innerHTML = '<div class="ga-log-entry">Запуск генетического алгоритма...</div>';
    
    const generationsArr = [];
    const fitnessHistory = [];
    let convergencePlotCreated = false;
    let populationPlotCreated = false;
    let surfaceData = null;
    
    const onIteration = (data) => {
        console.log("Iteration:", data.generation, "Best fitness:", data.bestFitness);
        
        if (data.bestIndividual && !isNaN(data.bestIndividual.x) && !isNaN(data.bestIndividual.y)) {
            document.getElementById('ga-best-x').textContent = data.bestIndividual.x.toFixed(6);
            document.getElementById('ga-best-y').textContent = data.bestIndividual.y.toFixed(6);
            document.getElementById('ga-best-f').textContent = data.bestFitness.toFixed(10);
        }
        
        generationsArr.push(data.generation);
        fitnessHistory.push(data.bestFitness);
        
        if (convergencePlotCreated) {
            Plotly.update('ga-convergence-plot', {
                x: [generationsArr],
                y: [fitnessHistory]
            });
        } else {
            Plotly.newPlot('ga-convergence-plot', [{
                x: generationsArr,
                y: fitnessHistory,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#e74c3c', width: 2 },
                marker: { size: 3 }
            }], {
                title: 'Сходимость генетического алгоритма',
                xaxis: { title: 'Поколение' },
                yaxis: { title: 'f(x,y)' }
            });
            convergencePlotCreated = true;
        }
        
        if (!surfaceData) {
            surfaceData = createGASurface(gaSolver.xRange, gaSolver.yRange, 50);
        }
        
        const validPoints = data.population.filter(p => !isNaN(p.x) && !isNaN(p.y));
        const xVals = validPoints.map(p => p.x);
        const yVals = validPoints.map(p => p.y);
        const zVals = validPoints.map(p => {
            let z = gaSolver.rosenbrock(p.x, p.y);
            if (isNaN(z) || z > 100) z = 100;
            return z;
        });
        
        if (populationPlotCreated) {
            Plotly.update('ga-population-plot', {
                x: [xVals],
                y: [yVals],
                z: [zVals]
            }, {}, [1]);
            
            if (data.bestIndividual && !isNaN(data.bestIndividual.x)) {
                let bestZ = gaSolver.rosenbrock(data.bestIndividual.x, data.bestIndividual.y);
                if (isNaN(bestZ) || bestZ > 100) bestZ = 100;
                Plotly.update('ga-population-plot', {
                    x: [[data.bestIndividual.x]],
                    y: [[data.bestIndividual.y]],
                    z: [[bestZ]]
                }, {}, [2]);
            }
        } else {
            const surfaceTrace = {
                type: 'surface',
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                colorscale: 'Viridis',
                opacity: 0.7,
                showscale: true,
                colorbar: { title: 'f(x,y)' },
                name: 'Функция Розенброка'
            };
            
            const populationTrace = {
                type: 'scatter3d',
                x: xVals,
                y: yVals,
                z: zVals,
                mode: 'markers',
                marker: { color: 'blue', size: 4, opacity: 0.8 },
                name: 'Популяция'
            };
            
            let bestZ = gaSolver.rosenbrock(data.bestIndividual.x, data.bestIndividual.y);
            if (isNaN(bestZ) || bestZ > 100) bestZ = 100;
            const bestTrace = {
                type: 'scatter3d',
                x: [data.bestIndividual.x],
                y: [data.bestIndividual.y],
                z: [bestZ],
                mode: 'markers',
                marker: { color: 'red', size: 10, symbol: 'diamond' },
                name: 'Лучшее решение'
            };
            
            const trueMinTrace = {
                type: 'scatter3d',
                x: [1],
                y: [1],
                z: [0],
                mode: 'markers',
                marker: { color: 'green', size: 8, symbol: 'circle' },
                name: 'Истинный минимум (1,1)'
            };
            
            Plotly.newPlot('ga-population-plot', [surfaceTrace, populationTrace, bestTrace, trueMinTrace], {
                title: `Популяция (поколение ${data.generation})`,
                scene: {
                    xaxis: { title: 'x', range: gaSolver.xRange },
                    yaxis: { title: 'y', range: gaSolver.yRange },
                    zaxis: { title: 'f(x,y)', autorange: true },
                    camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
                }
            });
            populationPlotCreated = true;
        }
        
        const entry = document.createElement('div');
        entry.className = 'ga-log-entry';
        entry.textContent = `Поколение ${data.generation}: x=${data.bestIndividual.x.toFixed(6)}, y=${data.bestIndividual.y.toFixed(6)}, f=${data.bestFitness.toFixed(10)}`;
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
    };
    
    gaRunning = true;
    const result = await gaSolver.solve(onIteration, delay);
    gaRunning = false;
    
    console.log("GA finished:", result);
    
    document.getElementById('ga-start-btn').disabled = false;
    document.getElementById('ga-stop-btn').disabled = true;
    document.getElementById('ga-reset-btn').disabled = false;
    
    const finalEntry = document.createElement('div');
    finalEntry.className = 'ga-log-entry';
    finalEntry.style.color = '#2ecc71';
    finalEntry.textContent = `✓ Завершено! Лучшее решение: x=${result.solution.x.toFixed(6)}, y=${result.solution.y.toFixed(6)}, f=${result.fitness.toFixed(10)}`;
    logDiv.appendChild(finalEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function stopGA() {
    console.log("stopGA called");
    if (gaSolver) {
        gaSolver.stop();
    }
    gaRunning = false;
    document.getElementById('ga-start-btn').disabled = false;
    document.getElementById('ga-stop-btn').disabled = true;
    document.getElementById('ga-reset-btn').disabled = false;
}

function resetGA() {
    console.log("resetGA called");
    if (gaRunning) stopGA();
    
    document.getElementById('ga-best-x').textContent = '—';
    document.getElementById('ga-best-y').textContent = '—';
    document.getElementById('ga-best-f').textContent = '—';
    document.getElementById('ga-log').innerHTML = '';
    
    Plotly.purge('ga-convergence-plot');
    Plotly.purge('ga-population-plot');
    
    Plotly.newPlot('ga-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers'
    }], {
        title: 'Сходимость',
        xaxis: { title: 'Поколение' },
        yaxis: { title: 'f(x,y)' }
    });
    
    const xRange = [-2, 2];
    const yRange = [-1, 3];
    const surfaceData = createGASurface(xRange, yRange, 40);
    
    Plotly.newPlot('ga-population-plot', [{
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: 'Viridis',
        opacity: 0.7,
        name: 'Функция Розенброка'
    }], {
        title: 'Популяция',
        scene: {
            xaxis: { title: 'x', range: xRange },
            yaxis: { title: 'y', range: yRange },
            zaxis: { title: 'f' }
        }
    });
}

function initLab3() {
    console.log("initLab3 called");
    
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) {
        console.error("tabsContainer not found");
        return;
    }
    
    if (document.getElementById('lab3')) {
        console.log("lab3 already exists, reattaching handlers");
        const startBtn = document.getElementById('ga-start-btn');
        const stopBtn = document.getElementById('ga-stop-btn');
        const resetBtn = document.getElementById('ga-reset-btn');
        
        if (startBtn) startBtn.onclick = (e) => { e.preventDefault(); startGA(); };
        if (stopBtn) stopBtn.onclick = () => stopGA();
        if (resetBtn) resetBtn.onclick = () => resetGA();
        return;
    }
    
    const lab3Button = document.createElement('button');
    lab3Button.className = 'tab-button';
    lab3Button.textContent = 'Лабораторная работа №3: Генетический алгоритм';
    lab3Button.onclick = (e) => openTab(e, 'lab3');
    tabsContainer.appendChild(lab3Button);
    
    const lab3Content = document.createElement('div');
    lab3Content.id = 'lab3';
    lab3Content.className = 'tab-content';
    lab3Content.innerHTML = `
        <div class="lab3-container">
            <div class="lab3-params">
                <div class="param-section">
                    <h3>Параметры генетического алгоритма</h3>
                    <div class="param-row">
                        <label>Размер популяции:</label>
                        <input type="number" id="ga-population-size" value="50" min="10" max="500" step="10">
                    </div>
                    <div class="param-row">
                        <label>Количество поколений:</label>
                        <input type="number" id="ga-generations" value="100" min="10" max="1000">
                    </div>
                    <div class="param-row">
                        <label>Вероятность кроссинговера:</label>
                        <input type="number" id="ga-crossover-prob" value="0.8" min="0" max="1" step="0.05">
                    </div>
                    <div class="param-row">
                        <label>Вероятность мутации:</label>
                        <input type="number" id="ga-mutation-prob" value="0.05" min="0" max="0.5" step="0.005">
                    </div>
                    <div class="param-row">
                        <label>Размер турнира:</label>
                        <input type="number" id="ga-tournament-size" value="3" min="2" max="20">
                    </div>
                    <div class="param-row">
                        <label>Элитные особи:</label>
                        <input type="number" id="ga-elite-count" value="2" min="0" max="20">
                    </div>
                    <div class="param-row">
                        <label>Задержка (мс):</label>
                        <input type="number" id="ga-delay" value="100" min="0" max="1000" step="50">
                    </div>
                </div>
                <div class="param-section">
                    <h3>Область поиска</h3>
                    <div class="param-row">
                        <label>X min:</label>
                        <input type="number" id="ga-x-min" value="-2" step="0.5">
                    </div>
                    <div class="param-row">
                        <label>X max:</label>
                        <input type="number" id="ga-x-max" value="2" step="0.5">
                    </div>
                    <div class="param-row">
                        <label>Y min:</label>
                        <input type="number" id="ga-y-min" value="-1" step="0.5">
                    </div>
                    <div class="param-row">
                        <label>Y max:</label>
                        <input type="number" id="ga-y-max" value="3" step="0.5">
                    </div>
                </div>
                <div class="param-section">
                    <h3>Функция Розенброка</h3>
                    <div class="function-display">
                        f(x,y) = 100·(y - x²)² + (1 - x)²
                    </div>
                    <div class="info-text">
                        Глобальный минимум: f(1, 1) = 0
                    </div>
                </div>
                <div class="lab3-button-group">
                    <button id="ga-start-btn" class="lab3-btn primary">Запустить ГА</button>
                    <button id="ga-stop-btn" class="lab3-btn secondary" disabled>Остановить</button>
                    <button id="ga-reset-btn" class="lab3-btn secondary">Сбросить</button>
                </div>
            </div>
            <div class="lab3-results">
                <div class="result-section">
                    <h3>Текущее лучшее решение</h3>
                    <div id="ga-best-solution" class="best-solution">
                        <div>x* = <span id="ga-best-x">—</span></div>
                        <div>y* = <span id="ga-best-y">—</span></div>
                        <div>f(x*,y*) = <span id="ga-best-f">—</span></div>
                    </div>
                </div>
                <div class="result-section">
                    <h3>График сходимости</h3>
                    <div id="ga-convergence-plot" style="height: 280px;"></div>
                </div>
                <div class="result-section">
                    <h3>Популяция</h3>
                    <div id="ga-population-plot" style="height: 280px;"></div>
                </div>
                <div class="result-section">
                    <h3>Журнал</h3>
                    <div id="ga-log" class="ga-log"></div>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.container').appendChild(lab3Content);
    
    if (!document.querySelector('#lab3-styles')) {
        const lab3Styles = document.createElement('style');
        lab3Styles.id = 'lab3-styles';
        lab3Styles.textContent = `
            .lab3-container { display: flex; gap: 20px; height: calc(100vh - 200px); min-height: 500px; }
            .lab3-params { flex: 1; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; padding-right: 10px; }
            .lab3-results { flex: 3; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; }
            .param-section { background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
            .param-section h3 { margin: 0 0 10px 0; font-size: 0.95rem; color: #2c3e50; }
            .param-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .param-row label { font-size: 0.85rem; color: #34495e; }
            .param-row input { width: 100px; padding: 4px 6px; border: 1px solid #bdc3c7; border-radius: 4px; }
            .function-display { background-color: #ecf0f1; padding: 10px; border-radius: 6px; font-family: monospace; text-align: center; margin-bottom: 10px; }
            .info-text { font-size: 0.8rem; color: #7f8c8d; text-align: center; }
            .lab3-button-group { display: flex; gap: 10px; margin-top: 10px; }
            .lab3-btn { flex: 1; padding: 8px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
            .lab3-btn.primary { background-color: #3498db; color: white; }
            .lab3-btn.primary:hover { background-color: #2980b9; }
            .lab3-btn.secondary { background-color: #95a5a6; color: white; }
            .lab3-btn.secondary:hover { background-color: #7f8c8d; }
            .lab3-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .best-solution { background-color: #2ecc71; color: white; padding: 12px; border-radius: 8px; display: flex; justify-content: space-around; font-weight: bold; }
            .best-solution span { font-size: 1.1rem; }
            .ga-log { background-color: #1e1e1e; color: #d4d4d4; font-family: monospace; font-size: 0.7rem; height: 150px; overflow-y: auto; padding: 8px; border-radius: 6px; }
            .ga-log-entry { padding: 2px 0; border-bottom: 1px solid #333; }
            @media (max-width: 768px) { .lab3-container { flex-direction: column; } }
        `;
        document.head.appendChild(lab3Styles);
    }
    
    const xRange = [-2, 2];
    const yRange = [-1, 3];
    const surfaceData = createGASurface(xRange, yRange, 40);
    
    Plotly.newPlot('ga-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers'
    }], {
        title: 'Сходимость',
        xaxis: { title: 'Поколение' },
        yaxis: { title: 'f(x,y)' }
    });
    
    Plotly.newPlot('ga-population-plot', [{
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: 'Viridis',
        opacity: 0.7,
        name: 'Функция Розенброка'
    }], {
        title: 'Популяция',
        scene: {
            xaxis: { title: 'x', range: xRange },
            yaxis: { title: 'y', range: yRange },
            zaxis: { title: 'f' }
        }
    });
    
    const startBtn = document.getElementById('ga-start-btn');
    const stopBtn = document.getElementById('ga-stop-btn');
    const resetBtn = document.getElementById('ga-reset-btn');
    
    if (startBtn) {
        startBtn.onclick = (e) => {
            e.preventDefault();
            console.log("Start button clicked!");
            startGA();
        };
    }
    if (stopBtn) stopBtn.onclick = () => stopGA();
    if (resetBtn) resetBtn.onclick = () => resetGA();
}

// 444444444444

const psoFunctions = {
    sphere: {
        name: 'Сфера',
        f: (x, y) => x*x + y*y,
        globalMin: [0, 0],
        globalVal: 0,
        info: 'f(x,y) = x² + y²<br>Глобальный минимум: f(0, 0) = 0',
        range: [-5, 5]
    },
    rastrigin: {
        name: 'Растригина',
        f: (x, y) => 20 + x*x + y*y - 10*(Math.cos(2*Math.PI*x) + Math.cos(2*Math.PI*y)),
        globalMin: [0, 0],
        globalVal: 0,
        info: 'f(x,y) = 20 + x² + y² - 10·(cos(2πx) + cos(2πy))<br>Глобальный минимум: f(0, 0) = 0',
        range: [-5.12, 5.12]
    },
    rosenbrock: {
        name: 'Розенброка',
        f: (x, y) => 100*Math.pow(y - x*x, 2) + Math.pow(1 - x, 2),
        globalMin: [1, 1],
        globalVal: 0,
        info: 'f(x,y) = 100·(y - x²)² + (1 - x)²<br>Глобальный минимум: f(1, 1) = 0',
        range: [-2, 2]
    },
    ackley: {
        name: 'Акли',
        f: (x, y) => -20 * Math.exp(-0.2 * Math.sqrt(0.5*(x*x + y*y))) - Math.exp(0.5*(Math.cos(2*Math.PI*x) + Math.cos(2*Math.PI*y))) + 20 + Math.E,
        globalMin: [0, 0],
        globalVal: 0,
        info: 'f(x,y) = -20·exp(-0.2·√(0.5·(x²+y²))) - exp(0.5·(cos(2πx)+cos(2πy))) + 20 + e<br>Глобальный минимум: f(0, 0) = 0',
        range: [-5, 5]
    }
};

class ParticleSwarmOptimizer3D {
    constructor(func, xRange, yRange) {
        this.swarmSize = 50;
        this.iterations = 100;
        this.w = 0.7;
        this.c1 = 1.5;
        this.c2 = 1.5;
        this.xRange = xRange;
        this.yRange = yRange;
        this.func = func;
        
        this.particles = [];
        this.pBestPositions = [];
        this.pBestValues = [];
        this.gBestPosition = null;
        this.gBestValue = Infinity;
        
        this.history = [];
        this.currentIteration = 0;
        this.isRunning = false;
    }

    initSwarm() {
        this.particles = [];
        this.pBestPositions = [];
        this.pBestValues = [];
        this.gBestValue = Infinity;
        
        for (let i = 0; i < this.swarmSize; i++) {
            const x = this.xRange[0] + Math.random() * (this.xRange[1] - this.xRange[0]);
            const y = this.yRange[0] + Math.random() * (this.yRange[1] - this.yRange[0]);
            const position = { x: x, y: y };
            
            const vx = (Math.random() - 0.5) * (this.xRange[1] - this.xRange[0]) / 2;
            const vy = (Math.random() - 0.5) * (this.yRange[1] - this.yRange[0]) / 2;
            const velocity = { x: vx, y: vy };
            
            const value = this.func(position.x, position.y);
            
            this.particles.push({ position, velocity });
            this.pBestPositions.push({ x: position.x, y: position.y });
            this.pBestValues.push(value);
            
            if (value < this.gBestValue) {
                this.gBestValue = value;
                this.gBestPosition = { x: position.x, y: position.y };
            }
        }
    }

    updateVelocityAndPosition() {
        for (let i = 0; i < this.swarmSize; i++) {
            const r1 = Math.random();
            const r2 = Math.random();
            
            const particle = this.particles[i];
            
            const newVx = this.w * particle.velocity.x +
                          this.c1 * r1 * (this.pBestPositions[i].x - particle.position.x) +
                          this.c2 * r2 * (this.gBestPosition.x - particle.position.x);
            const newVy = this.w * particle.velocity.y +
                          this.c1 * r1 * (this.pBestPositions[i].y - particle.position.y) +
                          this.c2 * r2 * (this.gBestPosition.y - particle.position.y);
            
            particle.velocity = { x: newVx, y: newVy };
            
            let newX = particle.position.x + particle.velocity.x;
            let newY = particle.position.y + particle.velocity.y;
            
            newX = Math.max(this.xRange[0], Math.min(this.xRange[1], newX));
            newY = Math.max(this.yRange[0], Math.min(this.yRange[1], newY));
            
            particle.position = { x: newX, y: newY };
            
            const value = this.func(newX, newY);
            
            if (value < this.pBestValues[i]) {
                this.pBestPositions[i] = { x: newX, y: newY };
                this.pBestValues[i] = value;
                
                if (value < this.gBestValue) {
                    this.gBestValue = value;
                    this.gBestPosition = { x: newX, y: newY };
                }
            }
        }
    }

    async solve(onIteration, delay = 0) {
        this.initSwarm();
        this.isRunning = true;
        
        for (let iter = 0; iter < this.iterations && this.isRunning; iter++) {
            this.updateVelocityAndPosition();
            this.currentIteration = iter + 1;
            
            if (onIteration) {
                onIteration({
                    iteration: this.currentIteration,
                    bestValue: this.gBestValue,
                    bestPosition: this.gBestPosition,
                    particles: this.particles,
                    pBestValues: this.pBestValues
                });
            }
            
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return {
            solution: this.gBestPosition,
            value: this.gBestValue,
            history: this.history
        };
    }

    stop() {
        this.isRunning = false;
    }
}

let psoSolver = null;
let psoRunning = false;

function updatePSOFunctionInfo() {
    const funcName = document.getElementById('pso-function-select').value;
    const funcInfo = psoFunctions[funcName];
    document.getElementById('pso-func-info').innerHTML = funcInfo.info;
    
    const range = funcInfo.range;
    document.getElementById('pso-x-min').value = range[0];
    document.getElementById('pso-x-max').value = range[1];
    document.getElementById('pso-y-min').value = range[0];
    document.getElementById('pso-y-max').value = range[1];
    
    const xRange = [range[0], range[1]];
    const yRange = [range[0], range[1]];
    
    const surfaceData = createPSOSurface3D(funcInfo.f, xRange, yRange, 40);
    
    const surfaceTrace = {
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: 'Viridis',
        opacity: 0.7,
        showscale: true,
        colorbar: { title: 'f(x,y)' },
        name: 'Целевая функция'
    };
    
    Plotly.react('pso-swarm-plot', [surfaceTrace], {
        title: `Функция ${funcInfo.name}`,
        scene: {
            xaxis: { title: 'x', range: xRange },
            yaxis: { title: 'y', range: yRange },
            zaxis: { title: 'f(x,y)', autorange: true },
            camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
        },
        autosize: true,
        margin: { l: 0, r: 0, t: 50, b: 0 }
    });
}

function createPSOSurface3D(func, xRange, yRange, points = 50) {
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
            let val = func(xi, yj);
            if (isNaN(val) || val > 100) val = 100;
            row.push(val);
        }
        z.push(row);
    }
    
    return { x, y, z };
}

async function startPSO() {
    if (psoRunning) return;
    
    const funcName = document.getElementById('pso-function-select').value;
    const funcInfo = psoFunctions[funcName];
    const xRange = [
        parseFloat(document.getElementById('pso-x-min').value) || funcInfo.range[0],
        parseFloat(document.getElementById('pso-x-max').value) || funcInfo.range[1]
    ];
    const yRange = [
        parseFloat(document.getElementById('pso-y-min').value) || funcInfo.range[0],
        parseFloat(document.getElementById('pso-y-max').value) || funcInfo.range[1]
    ];
    
    psoSolver = new ParticleSwarmOptimizer3D(funcInfo.f, xRange, yRange);
    
    psoSolver.swarmSize = parseInt(document.getElementById('pso-swarm-size').value) || 50;
    psoSolver.iterations = parseInt(document.getElementById('pso-iterations').value) || 100;
    psoSolver.w = parseFloat(document.getElementById('pso-w').value) || 0.7;
    psoSolver.c1 = parseFloat(document.getElementById('pso-c1').value) || 1.5;
    psoSolver.c2 = parseFloat(document.getElementById('pso-c2').value) || 1.5;
    
    const delay = parseInt(document.getElementById('pso-delay').value) || 100;
    
    document.getElementById('pso-start-btn').disabled = true;
    document.getElementById('pso-stop-btn').disabled = false;
    document.getElementById('pso-reset-btn').disabled = true;
    
    const logDiv = document.getElementById('pso-log');
    logDiv.innerHTML = '';
    
    const iterations = [];
    const values = [];
    let convergencePlotCreated = false;
    let swarmPlotCreated = false;
    let surfaceData = null;
    let lastIteration = 0;
    
    const onIteration = (data) => {
        if (data.bestPosition && !isNaN(data.bestPosition.x) && !isNaN(data.bestPosition.y)) {
            document.getElementById('pso-best-x').textContent = data.bestPosition.x.toFixed(6);
            document.getElementById('pso-best-y').textContent = data.bestPosition.y.toFixed(6);
            document.getElementById('pso-best-f').textContent = data.bestValue.toFixed(10);
        }
        
        iterations.push(data.iteration);
        values.push(data.bestValue);
        
        if (convergencePlotCreated) {
            Plotly.update('pso-convergence-plot', 
                { x: [iterations], y: [values] },
                {}
            );
        } else {
            Plotly.newPlot('pso-convergence-plot', [{
                x: iterations, y: values, type: 'scatter', mode: 'lines+markers',
                line: { color: '#e74c3c', width: 2 }, marker: { size: 3 }
            }], { 
                title: 'Сходимость PSO', 
                xaxis: { title: 'Итерация' }, 
                yaxis: { title: 'f(x,y)' }
            });
            convergencePlotCreated = true;
        }
        
        if (!surfaceData) {
            surfaceData = createPSOSurface3D(psoSolver.func, psoSolver.xRange, psoSolver.yRange, 50);
        }
        
        const particleX = data.particles.map(p => p.position.x);
        const particleY = data.particles.map(p => p.position.y);
        const particleZ = data.particles.map(p => {
            let z = psoSolver.func(p.position.x, p.position.y);
            if (isNaN(z) || z > 100) z = 100;
            return z;
        });
        
        if (swarmPlotCreated) {
            Plotly.update('pso-swarm-plot', 
                { x: [particleX], y: [particleY], z: [particleZ] },
                {}, [1]
            );
            if (data.bestPosition) {
                let bestZ = psoSolver.func(data.bestPosition.x, data.bestPosition.y);
                if (isNaN(bestZ) || bestZ > 100) bestZ = 100;
                Plotly.update('pso-swarm-plot',
                    { x: [[data.bestPosition.x]], y: [[data.bestPosition.y]], z: [[bestZ]] },
                    {}, [2]
                );
            }
        } else {
            const surfaceTrace = {
                type: 'surface',
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                colorscale: 'Viridis',
                opacity: 0.7,
                showscale: true,
                colorbar: { title: 'f(x,y)' },
                name: 'Целевая функция'
            };
            
            const swarmTrace = {
                type: 'scatter3d',
                x: particleX,
                y: particleY,
                z: particleZ,
                mode: 'markers',
                marker: { color: 'blue', size: 4, opacity: 0.8 },
                name: 'Частицы'
            };
            
            let bestZ = psoSolver.func(data.bestPosition.x, data.bestPosition.y);
            if (isNaN(bestZ) || bestZ > 100) bestZ = 100;
            const bestTrace = {
                type: 'scatter3d',
                x: [data.bestPosition.x],
                y: [data.bestPosition.y],
                z: [bestZ],
                mode: 'markers',
                marker: { color: 'red', size: 8, symbol: 'diamond' },
                name: 'Лучшее решение'
            };
            
            const globalMin = psoFunctions[funcName].globalMin;
            let minZ = psoSolver.func(globalMin[0], globalMin[1]);
            if (isNaN(minZ) || minZ > 100) minZ = 100;
            const globalMinTrace = {
                type: 'scatter3d',
                x: [globalMin[0]],
                y: [globalMin[1]],
                z: [minZ],
                mode: 'markers',
                marker: { color: 'green', size: 8, symbol: 'circle' },
                name: 'Истинный минимум'
            };
            
            Plotly.newPlot('pso-swarm-plot', [surfaceTrace, swarmTrace, bestTrace, globalMinTrace], {
                title: `Рой частиц (итерация ${data.iteration}) - ${funcInfo.name}`,
                scene: {
                    xaxis: { title: 'x', range: psoSolver.xRange },
                    yaxis: { title: 'y', range: psoSolver.yRange },
                    zaxis: { title: 'f(x,y)', autorange: true },
                    camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
                },
                autosize: true,
                margin: { l: 0, r: 0, t: 50, b: 0 }
            });
            swarmPlotCreated = true;
        }
        
        if (data.iteration - lastIteration >= 5 || data.iteration === psoSolver.iterations) {
            lastIteration = data.iteration;
            const entry = document.createElement('div');
            entry.className = 'pso-log-entry';
            entry.textContent = `Итерация ${data.iteration}: x=${data.bestPosition.x.toFixed(6)}, y=${data.bestPosition.y.toFixed(6)}, f=${data.bestValue.toFixed(10)}`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    };
    
    psoRunning = true;
    const result = await psoSolver.solve(onIteration, delay);
    psoRunning = false;
    
    document.getElementById('pso-start-btn').disabled = false;
    document.getElementById('pso-stop-btn').disabled = true;
    document.getElementById('pso-reset-btn').disabled = false;
}

function stopPSO() {
    if (psoSolver) psoSolver.stop();
    psoRunning = false;
    document.getElementById('pso-start-btn').disabled = false;
    document.getElementById('pso-stop-btn').disabled = true;
    document.getElementById('pso-reset-btn').disabled = false;
}

function resetPSO() {
    if (psoRunning) stopPSO();
    
    document.getElementById('pso-best-x').textContent = '—';
    document.getElementById('pso-best-y').textContent = '—';
    document.getElementById('pso-best-f').textContent = '—';
    document.getElementById('pso-log').innerHTML = '';
    
    Plotly.purge('pso-convergence-plot');
    
    Plotly.newPlot('pso-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers'
    }], { title: 'Сходимость PSO', xaxis: { title: 'Итерация' }, yaxis: { title: 'f(x,y)' } });
    
    updatePSOFunctionInfo();
}

function initPSO() {
    const startBtn = document.getElementById('pso-start-btn');
    const stopBtn = document.getElementById('pso-stop-btn');
    const resetBtn = document.getElementById('pso-reset-btn');
    const funcSelect = document.getElementById('pso-function-select');
    
    if (startBtn) startBtn.onclick = () => startPSO();
    if (stopBtn) stopBtn.onclick = () => stopPSO();
    if (resetBtn) resetBtn.onclick = () => resetPSO();
    if (funcSelect) funcSelect.onchange = () => updatePSOFunctionInfo();
    
    Plotly.newPlot('pso-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers'
    }], { title: 'Сходимость PSO', xaxis: { title: 'Итерация' }, yaxis: { title: 'f(x,y)' } });
    
    updatePSOFunctionInfo();
}

// 555555

const baFunctions = {
    rosenbrock: {
        name: 'Розенброка',
        f: (x, y) => 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2),
        globalMin: [1, 1],
        globalVal: 0,
        info: 'f(x,y) = 100·(y - x²)² + (1 - x)²<br>Глобальный минимум: f(1, 1) = 0',
        range: [-2, 2]
    },
    himmelblau: {
        name: 'Химмельблау',
        f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
        globalMin: [3.0, 2.0],
        globalVal: 0,
        info: 'f(x,y) = (x² + y - 11)² + (x + y² - 7)²<br>Глобальный минимум: f(3, 2) = 0',
        range: [-10, 10]
    },
    rastrigin: {
        name: 'Растригина',
        f: (x, y) => 20 + x * x + y * y - 10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)),
        globalMin: [0, 0],
        globalVal: 0,
        info: 'f(x,y) = 20 + x² + y² - 10·(cos(2πx) + cos(2πy))<br>Глобальный минимум: f(0, 0) = 0',
        range: [-2, 2]
    }
};

class BeesAlgorithm {
    constructor(func, bounds) {
        this.func = func;
        this.bounds = bounds;

        this.numScouts = 16;
        this.numEliteSites = 2;
        this.numPerspSites = 3;
        this.numEliteBees = 7;
        this.numPerspBees = 4;
        this.radius = 0.2;
        this.maxIter = 500;
        this.stagnationLimit = 20;

        this.scouts = [];
        this.bestSolution = null;
        this.bestFitness = Infinity;
        this.history = [];
        this.stagnationCounter = 0;
        this.isRunning = false;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    initScouts() {
        this.scouts = [];
        for (let i = 0; i < this.numScouts; i++) {
            const scout = {
                x: this.bounds.x[0] + Math.random() * (this.bounds.x[1] - this.bounds.x[0]),
                y: this.bounds.y[0] + Math.random() * (this.bounds.y[1] - this.bounds.y[0])
            };
            scout.fitness = this.func(scout.x, scout.y);
            this.scouts.push(scout);

            if (scout.fitness < this.bestFitness) {
                this.bestFitness = scout.fitness;
                this.bestSolution = { x: scout.x, y: scout.y };
                this.stagnationCounter = 0;
            }
        }
    }

    localSearch(center, numBees) {
        let bestLocalFitness = Infinity;
        let bestLocalPos = { x: center.x, y: center.y };

        for (let i = 0; i < numBees; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const dist = Math.random() * this.radius;
            const newX = this.clamp(center.x + dist * Math.cos(angle), this.bounds.x[0], this.bounds.x[1]);
            const newY = this.clamp(center.y + dist * Math.sin(angle), this.bounds.y[0], this.bounds.y[1]);
            const newFitness = this.func(newX, newY);

            if (newFitness < bestLocalFitness) {
                bestLocalFitness = newFitness;
                bestLocalPos = { x: newX, y: newY };
            }
        }
        return { position: bestLocalPos, fitness: bestLocalFitness };
    }

    iterate() {
        this.scouts.sort((a, b) => a.fitness - b.fitness);

        const eliteSites = this.scouts.slice(0, this.numEliteSites);
        const perspSites = this.scouts.slice(this.numEliteSites, this.numEliteSites + this.numPerspSites);

        let improved = false;
        const newScouts = [];

        for (const site of eliteSites) {
            const result = this.localSearch(site, this.numEliteBees);
            newScouts.push(result.position);
            if (result.fitness < this.bestFitness) {
                this.bestFitness = result.fitness;
                this.bestSolution = { ...result.position };
                improved = true;
            }
        }

        for (const site of perspSites) {
            const result = this.localSearch(site, this.numPerspBees);
            newScouts.push(result.position);
            if (result.fitness < this.bestFitness) {
                this.bestFitness = result.fitness;
                this.bestSolution = { ...result.position };
                improved = true;
            }
        }

        const remainingScouts = this.numScouts - newScouts.length;
        for (let i = 0; i < remainingScouts; i++) {
            const scout = {
                x: this.bounds.x[0] + Math.random() * (this.bounds.x[1] - this.bounds.x[0]),
                y: this.bounds.y[0] + Math.random() * (this.bounds.y[1] - this.bounds.y[0])
            };
            scout.fitness = this.func(scout.x, scout.y);
            newScouts.push(scout);
            
            if (scout.fitness < this.bestFitness) {
                this.bestFitness = scout.fitness;
                this.bestSolution = { x: scout.x, y: scout.y };
                improved = true;
            }
        }

        this.scouts = newScouts.map(p => ({ ...p, fitness: this.func(p.x, p.y) }));

        if (improved) {
            this.stagnationCounter = 0;
        } else {
            this.stagnationCounter++;
        }

        this.history.push({
            scouts: JSON.parse(JSON.stringify(this.scouts)),
            bestFitness: this.bestFitness,
            bestSolution: { ...this.bestSolution }
        });
    }

    async solve(onIterationCallback, delay = 0) {
        this.isRunning = true;
        this.bestFitness = Infinity;
        this.history = [];
        this.stagnationCounter = 0;
        this.initScouts();

        if (onIterationCallback) {
            onIterationCallback({
                iteration: 0,
                bestFitness: this.bestFitness,
                bestSolution: this.bestSolution,
                scouts: this.scouts
            });
        }

        for (let iter = 1; iter <= this.maxIter && this.isRunning; iter++) {
            this.iterate();

            if (onIterationCallback) {
                onIterationCallback({
                    iteration: iter,
                    bestFitness: this.bestFitness,
                    bestSolution: this.bestSolution,
                    scouts: this.scouts
                });
            }

            if (this.stagnationCounter >= this.stagnationLimit) {
                console.log(`Алгоритм остановлен: стагнация в течение ${this.stagnationLimit} итераций.`);
                break;
            }

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        this.isRunning = false;
        return {
            solution: this.bestSolution,
            fitness: this.bestFitness,
            history: this.history
        };
    }

    stop() {
        this.isRunning = false;
    }
}

let baSolver = null;
let baRunning = false;

// Визуализация
function createBASurface(func, xRange, yRange, points = 100) {
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
            const val = func(xi, yj);
            row.push(val);
        }
        z.push(row);
    }
    return { x, y, z };
}

function updateBAFunctionInfo() {
    const funcName = document.getElementById('ba-function-select').value;
    const funcInfo = baFunctions[funcName];
    document.getElementById('ba-func-info').innerHTML = funcInfo.info;
}

async function startBA() {
    if (baRunning) return;

    const funcName = document.getElementById('ba-function-select').value;
    const funcInfo = baFunctions[funcName];
    const range = funcInfo.range;

    const params = {
        bounds: { x: [range[0], range[1]], y: [range[0], range[1]] },
        numScouts: parseInt(document.getElementById('ba-scouts').value) || 16,
        numEliteSites: parseInt(document.getElementById('ba-elite-sites').value) || 2,
        numPerspSites: parseInt(document.getElementById('ba-persp-sites').value) || 3,
        numEliteBees: parseInt(document.getElementById('ba-elite-bees').value) || 7,
        numPerspBees: parseInt(document.getElementById('ba-persp-bees').value) || 4,
        radius: parseFloat(document.getElementById('ba-radius').value) || 0.2,
        maxIter: parseInt(document.getElementById('ba-max-iter').value) || 500,
        stagnationLimit: parseInt(document.getElementById('ba-stagnation').value) || 20,
        delay: 50
    };

    baSolver = new BeesAlgorithm(funcInfo.f, params.bounds);
    Object.assign(baSolver, params);
    
    document.getElementById('ba-start-btn').disabled = true;
    document.getElementById('ba-stop-btn').disabled = false;
    document.getElementById('ba-reset-btn').disabled = true;
    const logDiv = document.getElementById('ba-log');
    logDiv.innerHTML = '';

    const surfaceData = createBASurface(funcInfo.f, params.bounds.x, params.bounds.y, 100);
    
    let convergencePlotCreated = false;
    let swarmPlotCreated = false;
    const convergenceX = [];
    const convergenceY = [];
    let lastLoggedIteration = -5;

    const onIteration = (data) => {
        if (data.bestSolution) {
            document.getElementById('ba-best-x').textContent = data.bestSolution.x.toFixed(6);
            document.getElementById('ba-best-y').textContent = data.bestSolution.y.toFixed(6);
            document.getElementById('ba-best-f').textContent = data.bestFitness.toFixed(10);
        }

        // График сходимости
        convergenceX.push(data.iteration);
        convergenceY.push(data.bestFitness);
        if (!convergencePlotCreated) {
            Plotly.newPlot('ba-convergence-plot', [{
                x: convergenceX, y: convergenceY, type: 'scatter', mode: 'lines+markers',
                line: { color: '#e74c3c', width: 2 }, marker: { size: 4 }
            }], {
                title: 'Сходимость пчелиного алгоритма',
                xaxis: { title: 'Итерация' },
                yaxis: { title: 'f(x,y)' }
            });
            convergencePlotCreated = true;
        } else {
            Plotly.update('ba-convergence-plot', { x: [convergenceX], y: [convergenceY] });
        }

        // 3D-визуализация
        const scoutsX = data.scouts.map(p => p.x);
        const scoutsY = data.scouts.map(p => p.y);
        const scoutsZ = data.scouts.map(p => p.fitness);

        const traces = [
            // Поверхность функции 
            {
                type: 'surface',
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                colorscale: 'Viridis',
                colorbar: { title: 'f(x,y)' },
                name: 'Функция',
                showscale: true
            },
            // Пчелы-разведчики
            {
                type: 'scatter3d',
                x: scoutsX,
                y: scoutsY,
                z: scoutsZ,
                mode: 'markers',
                marker: {
                    color: '#e74c3c',
                    size: 4,
                    symbol: 'circle',
                    line: { color: 'white', width: 1 }
                },
                name: 'Пчелы-разведчики'
            },
            // Лучшее решение (текущее)
            {
                type: 'scatter3d',
                x: [data.bestSolution.x],
                y: [data.bestSolution.y],
                z: [data.bestFitness],
                mode: 'markers+text',
                marker: {
                    color: 'yellow',
                    size: 8,
                    symbol: 'diamond',
                    line: { color: 'black', width: 1 }
                },
                text: ['Текущее'],
                textposition: 'top center',
                textfont: { size: 10, color: 'yellow' },
                name: 'Лучшее решение'
            },
            // Истинный минимум
            {
                type: 'scatter3d',
                x: [funcInfo.globalMin[0]],
                y: [funcInfo.globalMin[1]],
                z: [funcInfo.globalVal],
                mode: 'markers+text',
                marker: {
                    color: '#2ecc71',
                    size: 8,
                    symbol: 'circle-open',
                    line: { color: '#27ae60', width: 2 }
                },
                text: ['Истинный'],
                textposition: 'top center',
                textfont: { size: 10, color: '#2ecc71' },
                name: 'Истинный минимум'
            }
        ];

        const layout = {
            title: {
                text: `Итерация ${data.iteration} – ${funcInfo.name}`,
                font: { size: 14 }
            },
            scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'f(X, Y)' },
                camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
            },
            margin: { l: 0, r: 0, t: 40, b: 0 },
            showlegend: true,
            legend: { x: 0.8, y: 0.9 }
        };

        if (!swarmPlotCreated) {
            Plotly.newPlot('ba-swarm-plot', traces, layout);
            swarmPlotCreated = true;
        } else {
            Plotly.update('ba-swarm-plot', {
                x: [null, scoutsX, [data.bestSolution.x], [funcInfo.globalMin[0]]],
                y: [null, scoutsY, [data.bestSolution.y], [funcInfo.globalMin[1]]],
                z: [null, scoutsZ, [data.bestFitness], [funcInfo.globalVal]]
            }, {
                'title': `Итерация ${data.iteration} – ${funcInfo.name}`
            }, [1, 2, 3]);
        }

        // Журнал
        if (data.iteration % 5 === 0 || data.iteration === 1 || data.iteration === baSolver.maxIter) {
            const entry = document.createElement('div');
            entry.className = 'ba-log-entry';
            entry.textContent = `Ит. ${data.iteration}: f(${data.bestSolution.x.toFixed(4)}, ${data.bestSolution.y.toFixed(4)}) = ${data.bestFitness.toFixed(8)}`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    };

    baRunning = true;
    const result = await baSolver.solve(onIteration, params.delay);
    baRunning = false;

    document.getElementById('ba-start-btn').disabled = false;
    document.getElementById('ba-stop-btn').disabled = true;
    document.getElementById('ba-reset-btn').disabled = false;

    const finalScoutsX = result.history[result.history.length - 1].scouts.map(p => p.x);
    const finalScoutsY = result.history[result.history.length - 1].scouts.map(p => p.y);
    const finalScoutsZ = result.history[result.history.length - 1].scouts.map(p => p.fitness);

    const finalTraces = [
        // Поверхность функции
        {
            type: 'surface',
            x: surfaceData.x,
            y: surfaceData.y,
            z: surfaceData.z,
            colorscale: 'Viridis',
            colorbar: { title: 'f(x,y)' },
            name: 'Функция',
            showscale: true,
            opacity: 0.8
        },
        // Пчелы-разведчики (финальные позиции)
        {
            type: 'scatter3d',
            x: finalScoutsX,
            y: finalScoutsY,
            z: finalScoutsZ,
            mode: 'markers',
            marker: {
                color: '#e74c3c',
                size: 4,
                symbol: 'circle',
                line: { color: 'white', width: 1 },
                opacity: 0.6
            },
            name: 'Пчелы-разведчики'
        },
        // Лучшее решение (последнее)
        {
            type: 'scatter3d',
            x: [result.solution.x],
            y: [result.solution.y],
            z: [result.fitness],
            mode: 'markers',
            marker: {
                color: 'yellow',
                size: 10,
                symbol: 'diamond',
                line: { color: 'black', width: 2 }
            },
            name: 'Лучшее решение'
        },
        // Истинный минимум
        {
            type: 'scatter3d',
            x: [funcInfo.globalMin[0]],
            y: [funcInfo.globalMin[1]],
            z: [funcInfo.globalVal],
            mode: 'markers+text',
            marker: {
                color: '#2ecc71',
                size: 8,
                symbol: 'circle-open',
                line: { color: '#27ae60', width: 2 }
            },
            text: ['Истинный'],
            textposition: 'top center',
            textfont: { size: 10, color: '#2ecc71' },
            name: 'Истинный минимум'
        }
    ];

    const finalLayout = {
        title: {
            text: `РЕЗУЛЬТАТ: ${funcInfo.name} <br>f(${result.solution.x.toFixed(6)}, ${result.solution.y.toFixed(6)}) = ${result.fitness.toFixed(10)}`,
            font: { size: 14, color: '#2c3e50' }
        },
        scene: {
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' },
            zaxis: { title: 'f(X, Y)' },
            camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
        },
        margin: { l: 0, r: 0, t: 60, b: 0 },
        showlegend: true,
        legend: { x: 0.8, y: 0.9 }
    };

    Plotly.newPlot('ba-swarm-plot', finalTraces, finalLayout);

    // Финальная запись в журнал
    const finalEntry = document.createElement('div');
    finalEntry.className = 'ba-log-entry';
    finalEntry.style.color = '#2ecc71';
    finalEntry.style.fontWeight = 'bold';
    finalEntry.textContent = `ЗАВЕРШЕНО! Результат: f(${result.solution.x.toFixed(6)}, ${result.solution.y.toFixed(6)}) = ${result.fitness.toFixed(10)}`;
    logDiv.appendChild(finalEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function stopBA() {
    if (baSolver) baSolver.stop();
    baRunning = false;
    document.getElementById('ba-start-btn').disabled = false;
    document.getElementById('ba-stop-btn').disabled = true;
    document.getElementById('ba-reset-btn').disabled = false;
}

function resetBA() {
    if (baRunning) stopBA();
    document.getElementById('ba-best-x').textContent = '---';
    document.getElementById('ba-best-y').textContent = '---';
    document.getElementById('ba-best-f').textContent = '---';
    document.getElementById('ba-log').innerHTML = '';
    Plotly.purge('ba-convergence-plot');
    Plotly.purge('ba-swarm-plot');
    
    Plotly.newPlot('ba-convergence-plot', [{ x: [], y: [], type: 'scatter', mode: 'lines+markers' }], {
        title: 'Сходимость', xaxis: { title: 'Итерация' }, yaxis: { title: 'f(x,y)' }
    });
    
    const funcName = document.getElementById('ba-function-select').value;
    const funcInfo = baFunctions[funcName];
    const surfaceData = createBASurface(funcInfo.f, [funcInfo.range[0], funcInfo.range[1]], [funcInfo.range[0], funcInfo.range[1]], 100);
    Plotly.newPlot('ba-swarm-plot', [{
        type: 'surface', x: surfaceData.x, y: surfaceData.y, z: surfaceData.z,
        colorscale: 'Viridis', colorbar: { title: 'f(x,y)' }
    }], {
        title: `Функция ${funcInfo.name}`,
        scene: { xaxis: { title: 'X' }, yaxis: { title: 'Y' }, zaxis: { title: 'f(X, Y)' },
            camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } } }
    });

    updateBAFunctionInfo();
}

function initBA() {
    const startBtn = document.getElementById('ba-start-btn');
    const stopBtn = document.getElementById('ba-stop-btn');
    const resetBtn = document.getElementById('ba-reset-btn');
    const funcSelect = document.getElementById('ba-function-select');

    if (startBtn) startBtn.onclick = () => startBA();
    if (stopBtn) stopBtn.onclick = () => stopBA();
    if (resetBtn) resetBtn.onclick = () => resetBA();
    if (funcSelect) {
        funcSelect.onchange = () => {
            updateBAFunctionInfo();
            resetBA();
        };
    }

    resetBA();
}

// 66666666

const aisFunctions = {
    rosenbrock: {
        name: 'Розенброка',
        f: (x, y) => 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2),
        globalMin: [1, 1],
        globalVal: 0,
        info: 'f(x,y) = 100·(y - x²)² + (1 - x)²<br>Глобальный минимум: f(1, 1) = 0',
        range: [-2, 2]
    },
    himmelblau: {
        name: 'Химмельблау',
        f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
        globalMin: [3.0, 2.0],
        globalVal: 0,
        info: 'f(x,y) = (x² + y - 11)² + (x + y² - 7)²<br>Глобальный минимум: f(3, 2) = 0',
        range: [-5, 5]
    },
    rastrigin: {
        name: 'Растригина',
        f: (x, y) => 20 + x * x + y * y - 10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)),
        globalMin: [0, 0],
        globalVal: 0,
        info: 'f(x,y) = 20 + x² + y² - 10·(cos(2πx) + cos(2πy))<br>Глобальный минимум: f(0, 0) = 0',
        range: [-5.12, 5.12]
    }
};

class ArtificialImmuneSystem {
    constructor(func, bounds) {
        this.func = func;
        this.bounds = bounds;
        
        this.populationSize = 50;      
        this.nb = 10;                  
        this.nc = 5;                   
        this.nd = 5;                  
        this.mutationRate = 0.5;     
        this.selectionRate = 0.1;      
        this.stimulationThreshold = 0.1; 
        this.suppressionThreshold = 0.2; 
        this.renewalRate = 0.1;        
        this.maxIter = 200;
        
        // Состояние алгоритма
        this.population = [];          // S^b - популяция антител
        this.memoryCells = [];         // S^m - клетки памяти
        this.bestSolution = null;
        this.bestFitness = Infinity;
        this.history = [];
        this.isRunning = false;
    }
    
    // Инициализация популяции антител
    initPopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const antibody = {
                x: this.bounds.x[0] + Math.random() * (this.bounds.x[1] - this.bounds.x[0]),
                y: this.bounds.y[0] + Math.random() * (this.bounds.y[1] - this.bounds.y[0])
            };
            antibody.fitness = this.func(antibody.x, antibody.y);
            this.population.push(antibody);
            
            if (antibody.fitness < this.bestFitness) {
                this.bestFitness = antibody.fitness;
                this.bestSolution = { x: antibody.x, y: antibody.y };
            }
        }
    }
    
    // Вычисление аффинности (обратная величина к значению функции)
    calculateAffinity(fitness) {
        // Аффинность = 1 / (1 + fitness), чтобы избежать деления на ноль
        return 1.0 / (1.0 + fitness);
    }
    
    // Клонирование и мутация отобранных антител
    cloneAndMutate(selectedAntibodies) {
        const clones = [];
        
        for (const antibody of selectedAntibodies) {
            const affinity = this.calculateAffinity(antibody.fitness);
            // Число клонов пропорционально аффинности
            const numClones = Math.max(1, Math.floor(this.nc * affinity * 2));
            
            for (let i = 0; i < numClones; i++) {
                // Мутация по формуле из методички
                const alpha = this.mutationRate * (1.0 - affinity); // Адаптивная мутация
                const dx = alpha * (Math.random() - 0.5);
                const dy = alpha * (Math.random() - 0.5);
                
                const clone = {
                    x: this.clamp(antibody.x + dx, this.bounds.x[0], this.bounds.x[1]),
                    y: this.clamp(antibody.y + dy, this.bounds.y[0], this.bounds.y[1])
                };
                clone.fitness = this.func(clone.x, clone.y);
                clones.push(clone);
            }
        }
        
        return clones;
    }
    
    // Сжатие популяции (удаление похожих антител)
    suppressPopulation(population, threshold) {
        if (population.length <= 1) return population;
        
        const suppressed = [population[0]];
        
        for (let i = 1; i < population.length; i++) {
            let isSimilar = false;
            for (const existing of suppressed) {
                const distance = Math.sqrt(
                    Math.pow(population[i].x - existing.x, 2) + 
                    Math.pow(population[i].y - existing.y, 2)
                );
                if (distance < threshold) {
                    isSimilar = true;
                    break;
                }
            }
            if (!isSimilar) {
                suppressed.push(population[i]);
            }
        }
        
        return suppressed;
    }
    
    // Одна итерация алгоритма
    iterate() {
        // Шаг 1: Сортируем популяцию по фитнесу (возрастание)
        this.population.sort((a, b) => a.fitness - b.fitness);
        
        // Шаг 2: Выбираем n_b лучших антител
        const selectedAntibodies = this.population.slice(0, this.nb);
        
        // Шаг 3: Клонирование и мутация
        let clones = this.cloneAndMutate(selectedAntibodies);
        
        // Шаг 4: Отбор n_d лучших клонов
        clones.sort((a, b) => a.fitness - b.fitness);
        const bestClones = clones.slice(0, this.nd);
        
        // Шаг 5: Сжатие клонов
        const suppressedClones = this.suppressPopulation(bestClones, this.suppressionThreshold);
        
        // Шаг 6: Обновление клеток памяти
        this.memoryCells = [...suppressedClones];
        
        // Удаляем клетки с низкой аффинностью (ниже порога стимуляции)
        this.memoryCells = this.memoryCells.filter(cell => 
            this.calculateAffinity(cell.fitness) > this.stimulationThreshold
        );
        
        // Шаг 7: Объединяем популяцию с клетками памяти и сжимаем
        this.population = [...this.population, ...this.memoryCells];
        this.population.sort((a, b) => a.fitness - b.fitness);
        
        // Сохраняем лучшие решения
        this.population = this.suppressPopulation(
            this.population.slice(0, Math.floor(this.populationSize * 1.5)), 
            this.suppressionThreshold / 2
        );
        
        // Обрезаем до размера популяции
        if (this.population.length > this.populationSize) {
            this.population = this.population.slice(0, this.populationSize);
        }
        
        // Шаг 8: Обновление популяции (замена худших новыми случайными)
        const numToReplace = Math.floor(this.renewalRate * this.population.length);
        this.population.sort((a, b) => b.fitness - a.fitness); // Сортируем по убыванию
        
        for (let i = 0; i < numToReplace; i++) {
            this.population[i] = {
                x: this.bounds.x[0] + Math.random() * (this.bounds.x[1] - this.bounds.x[0]),
                y: this.bounds.y[0] + Math.random() * (this.bounds.y[1] - this.bounds.y[0])
            };
            this.population[i].fitness = this.func(this.population[i].x, this.population[i].y);
        }
        
        // Шаг 9: Обновляем лучшее решение
        for (const antibody of this.population) {
            if (antibody.fitness < this.bestFitness) {
                this.bestFitness = antibody.fitness;
                this.bestSolution = { x: antibody.x, y: antibody.y };
            }
        }
        
        this.history.push({
            population: JSON.parse(JSON.stringify(this.population)),
            bestFitness: this.bestFitness,
            bestSolution: { ...this.bestSolution },
            memoryCells: JSON.parse(JSON.stringify(this.memoryCells))
        });
    }
    
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    async solve(onIterationCallback, delay = 0) {
        this.isRunning = true;
        this.bestFitness = Infinity;
        this.history = [];
        this.memoryCells = [];
        
        this.initPopulation();
        
        if (onIterationCallback) {
            onIterationCallback({
                iteration: 0,
                bestFitness: this.bestFitness,
                bestSolution: this.bestSolution,
                population: this.population,
                memoryCells: this.memoryCells
            });
        }
        
        for (let iter = 1; iter <= this.maxIter && this.isRunning; iter++) {
            this.iterate();
            
            if (onIterationCallback) {
                onIterationCallback({
                    iteration: iter,
                    bestFitness: this.bestFitness,
                    bestSolution: this.bestSolution,
                    population: this.population,
                    memoryCells: this.memoryCells
                });
            }
            
            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        this.isRunning = false;
        return {
            solution: this.bestSolution,
            fitness: this.bestFitness,
            history: this.history
        };
    }
    
    stop() {
        this.isRunning = false;
    }
}

let aisSolver = null;
let aisRunning = false;

function createAISSurface(func, xRange, yRange, points = 80) {
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
            const val = func(xi, yj);
            row.push(val);
        }
        z.push(row);
    }
    return { x, y, z };
}

function updateAISFunctionInfo() {
    const funcName = document.getElementById('ais-function-select').value;
    const funcInfo = aisFunctions[funcName];
    document.getElementById('ais-func-info').innerHTML = funcInfo.info;
}

async function startAIS() {
    if (aisRunning) return;
    
    const funcName = document.getElementById('ais-function-select').value;
    const funcInfo = aisFunctions[funcName];
    const range = funcInfo.range;
    
    const bounds = { 
        x: [range[0], range[1]], 
        y: [range[0], range[1]] 
    };
    
    aisSolver = new ArtificialImmuneSystem(funcInfo.f, bounds);
    
    // Загрузка параметров из формы
    aisSolver.populationSize = parseInt(document.getElementById('ais-population-size').value) || 50;
    aisSolver.nb = parseInt(document.getElementById('ais-nb').value) || 10;
    aisSolver.nc = parseInt(document.getElementById('ais-nc').value) || 5;
    aisSolver.nd = parseInt(document.getElementById('ais-nd').value) || 5;
    aisSolver.mutationRate = parseFloat(document.getElementById('ais-mutation-rate').value) || 0.5;
    aisSolver.selectionRate = parseFloat(document.getElementById('ais-selection-rate').value) || 0.1;
    aisSolver.stimulationThreshold = parseFloat(document.getElementById('ais-stimulation-threshold').value) || 0.1;
    aisSolver.suppressionThreshold = parseFloat(document.getElementById('ais-suppression-threshold').value) || 0.2;
    aisSolver.renewalRate = parseFloat(document.getElementById('ais-renewal-rate').value) || 0.1;
    aisSolver.maxIter = parseInt(document.getElementById('ais-max-iter').value) || 200;
    
    const delay = parseInt(document.getElementById('ais-delay').value) || 100;
    
    // Блокировка кнопок
    document.getElementById('ais-start-btn').disabled = true;
    document.getElementById('ais-stop-btn').disabled = false;
    document.getElementById('ais-reset-btn').disabled = true;
    
    const logDiv = document.getElementById('ais-log');
    logDiv.innerHTML = '';
    
    // Создание поверхности для визуализации
    const surfaceData = createAISSurface(funcInfo.f, bounds.x, bounds.y, 80);
    
    let convergencePlotCreated = false;
    let swarmPlotCreated = false;
    const convergenceX = [];
    const convergenceY = [];
    
    const onIteration = (data) => {
        // Обновление лучшего решения
        if (data.bestSolution) {
            document.getElementById('ais-best-x').textContent = data.bestSolution.x.toFixed(6);
            document.getElementById('ais-best-y').textContent = data.bestSolution.y.toFixed(6);
            document.getElementById('ais-best-f').textContent = data.bestFitness.toFixed(10);
        }
        
        // График сходимости
        convergenceX.push(data.iteration);
        convergenceY.push(data.bestFitness);
        
        if (!convergencePlotCreated) {
            Plotly.newPlot('ais-convergence-plot', [{
                x: convergenceX,
                y: convergenceY,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#e74c3c', width: 2 },
                marker: { size: 4 }
            }], {
                title: 'Сходимость иммунной сети',
                xaxis: { title: 'Итерация' },
                yaxis: { title: 'f(x,y)' }
            });
            convergencePlotCreated = true;
        } else {
            Plotly.update('ais-convergence-plot', {
                x: [convergenceX],
                y: [convergenceY]
            });
        }
        
        const popX = data.population.map(p => p.x);
        const popY = data.population.map(p => p.y);
        const popZ = data.population.map(p => p.fitness);
        
        const memoryX = data.memoryCells.map(p => p.x);
        const memoryY = data.memoryCells.map(p => p.y);
        const memoryZ = data.memoryCells.map(p => p.fitness);
        
        const traces = [
            // Поверхность функции
            {
                type: 'surface',
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                colorscale: 'Viridis',
                colorbar: { title: 'f(x,y)' },
                name: 'Функция',
                showscale: true,
                opacity: 0.8
            },
            // Антитела (популяция)
            {
                type: 'scatter3d',
                x: popX,
                y: popY,
                z: popZ,
                mode: 'markers',
                marker: {
                    color: '#3498db',
                    size: 4,
                    symbol: 'circle',
                    line: { color: 'white', width: 1 }
                },
                name: 'Антитела (Sᵇ)'
            },
            // Клетки памяти
            {
                type: 'scatter3d',
                x: memoryX,
                y: memoryY,
                z: memoryZ,
                mode: 'markers',
                marker: {
                    color: '#e74c3c',
                    size: 6,
                    symbol: 'diamond',
                    line: { color: 'white', width: 1 }
                },
                name: 'Клетки памяти (Sᵐ)'
            },
            // Лучшее решение
            {
                type: 'scatter3d',
                x: [data.bestSolution.x],
                y: [data.bestSolution.y],
                z: [data.bestFitness],
                mode: 'markers+text',
                marker: {
                    color: 'yellow',
                    size: 10,
                    symbol: 'star',
                    line: { color: 'black', width: 2 }
                },
                text: ['Лучшее'],
                textposition: 'top center',
                textfont: { size: 10, color: 'yellow' },
                name: 'Лучшее решение'
            },
            // Истинный минимум
            {
                type: 'scatter3d',
                x: [funcInfo.globalMin[0]],
                y: [funcInfo.globalMin[1]],
                z: [funcInfo.globalVal],
                mode: 'markers+text',
                marker: {
                    color: '#2ecc71',
                    size: 8,
                    symbol: 'circle-open',
                    line: { color: '#27ae60', width: 2 }
                },
                text: ['Истинный'],
                textposition: 'top center',
                textfont: { size: 10, color: '#2ecc71' },
                name: 'Истинный минимум'
            }
        ];
        
        const layout = {
            title: {
                text: `Итерация ${data.iteration} – ${funcInfo.name}`,
                font: { size: 14 }
            },
            scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'f(X, Y)' },
                camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
            },
            margin: { l: 0, r: 0, t: 40, b: 0 },
            showlegend: true,
            legend: { x: 0.8, y: 0.9 }
        };
        
        if (!swarmPlotCreated) {
            Plotly.newPlot('ais-swarm-plot', traces, layout);
            swarmPlotCreated = true;
        } else {
            Plotly.update('ais-swarm-plot', {
                x: [null, popX, memoryX, [data.bestSolution.x], [funcInfo.globalMin[0]]],
                y: [null, popY, memoryY, [data.bestSolution.y], [funcInfo.globalMin[1]]],
                z: [null, popZ, memoryZ, [data.bestFitness], [funcInfo.globalVal]]
            }, {
                'title': `Итерация ${data.iteration} – ${funcInfo.name}`
            }, [1, 2, 3, 4]);
        }
        
        if (data.iteration % 5 === 0 || data.iteration === 1) {
            const entry = document.createElement('div');
            entry.className = 'ais-log-entry';
            entry.textContent = `Ит. ${data.iteration}: f(${data.bestSolution.x.toFixed(4)}, ${data.bestSolution.y.toFixed(4)}) = ${data.bestFitness.toFixed(8)} | Популяция: ${data.population.length} | Память: ${data.memoryCells.length}`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    };
    
    aisRunning = true;
    const result = await aisSolver.solve(onIteration, delay);
    aisRunning = false;
    
    document.getElementById('ais-start-btn').disabled = false;
    document.getElementById('ais-stop-btn').disabled = true;
    document.getElementById('ais-reset-btn').disabled = false;
    
    const finalEntry = document.createElement('div');
    finalEntry.className = 'ais-log-entry';
    finalEntry.style.color = '#2ecc71';
    finalEntry.style.fontWeight = 'bold';
    finalEntry.textContent = `✓ ЗАВЕРШЕНО! f(${result.solution.x.toFixed(6)}, ${result.solution.y.toFixed(6)}) = ${result.fitness.toFixed(10)}`;
    logDiv.appendChild(finalEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function stopAIS() {
    if (aisSolver) aisSolver.stop();
    aisRunning = false;
    document.getElementById('ais-start-btn').disabled = false;
    document.getElementById('ais-stop-btn').disabled = true;
    document.getElementById('ais-reset-btn').disabled = false;
}

function resetAIS() {
    if (aisRunning) stopAIS();
    document.getElementById('ais-best-x').textContent = '—';
    document.getElementById('ais-best-y').textContent = '—';
    document.getElementById('ais-best-f').textContent = '—';
    document.getElementById('ais-log').innerHTML = '';
    
    Plotly.purge('ais-convergence-plot');
    Plotly.purge('ais-swarm-plot');
    
    Plotly.newPlot('ais-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers'
    }], {
        title: 'Сходимость',
        xaxis: { title: 'Итерация' },
        yaxis: { title: 'f(x,y)' }
    });
    
    const funcName = document.getElementById('ais-function-select').value;
    const funcInfo = aisFunctions[funcName];
    const surfaceData = createAISSurface(
        funcInfo.f,
        [funcInfo.range[0], funcInfo.range[1]],
        [funcInfo.range[0], funcInfo.range[1]],
        80
    );
    
    Plotly.newPlot('ais-swarm-plot', [{
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: 'Viridis',
        colorbar: { title: 'f(x,y)' }
    }], {
        title: `Функция ${funcInfo.name}`,
        scene: {
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' },
            zaxis: { title: 'f(X, Y)' },
            camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
        }
    });
    
    updateAISFunctionInfo();
}

function initAIS() {
    const startBtn = document.getElementById('ais-start-btn');
    const stopBtn = document.getElementById('ais-stop-btn');
    const resetBtn = document.getElementById('ais-reset-btn');
    const funcSelect = document.getElementById('ais-function-select');
    
    if (startBtn) startBtn.onclick = () => startAIS();
    if (stopBtn) stopBtn.onclick = () => stopAIS();
    if (resetBtn) resetBtn.onclick = () => resetAIS();
    if (funcSelect) {
        funcSelect.onchange = () => {
            updateAISFunctionInfo();
            resetAIS();
        };
    }
    
    resetAIS();
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded - initializing all labs");
    
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
    
    if (document.getElementById('lab3')) {
        console.log("lab3 already exists, reattaching handlers");
        const startBtn = document.getElementById('ga-start-btn');
        const stopBtn = document.getElementById('ga-stop-btn');
        const resetBtn = document.getElementById('ga-reset-btn');
        
        if (startBtn) startBtn.onclick = (e) => { e.preventDefault(); startGA(); };
        if (stopBtn) stopBtn.onclick = () => stopGA();
        if (resetBtn) resetBtn.onclick = () => resetGA();
    }
    
    initPSO();
    
    initBA();
    
    initAIS();
    
    console.log("All labs initialized successfully!");
});


//77777777

const bfoSphere = (x, y) => -(x * x + y * y);

class BacterialForagingOptimizer {
    constructor() {
        this.reset();
    }

    reset() {
        this.bacteriaCount = 40;
        this.chemotaxisSteps = 50;
        this.reproductionSteps = 10;
        this.eliminationSteps = 4;
        this.stepSize = 0.1;
        this.eliminationProb = 0.25;
        this.stagnationLimit = 50;
        this.targetPrecision = 1e-6;
        
        this.xRange = [-5, 5];
        this.yRange = [-5, 5];
        
        this.func = bfoSphere;
        
        this.bacteria = [];
        this.bestPosition = null;
        this.bestValue = -Infinity;
        this.history = [];
        this.isRunning = false;
        
        this.currentChemoStep = 0;
        this.currentReproStep = 0;
        this.currentElimStep = 0;
        this.totalIter = 0;
        this.stagnationCounter = 0;
    }

    initPopulation() {
        if (this.bacteriaCount % 2 !== 0) {
            this.bacteriaCount += 1;
        }
        
        this.bacteria = [];
        this.bestValue = -Infinity;
        this.stagnationCounter = 0;
        
        for (let i = 0; i < this.bacteriaCount; i++) {
            const x = this.xRange[0] + Math.random() * (this.xRange[1] - this.xRange[0]);
            const y = this.yRange[0] + Math.random() * (this.yRange[1] - this.yRange[0]);
            const value = this.func(x, y);
            
            this.bacteria.push({
                position: { x, y },
                value: value,
                health: 0
            });
            
            if (value > this.bestValue) {
                this.bestValue = value;
                this.bestPosition = { x, y };
            }
        }
    }

    chemotaxisStep() {
        let improved = false;
        
        for (let i = 0; i < this.bacteriaCount; i++) {
            const bacterium = this.bacteria[i];
            
            const Vx = Math.random() * 2 - 1;
            const Vy = Math.random() * 2 - 1;
            
            const norm = Math.sqrt(Vx * Vx + Vy * Vy);
            
            if (norm < 1e-10) continue;
            
            const dx = Vx / norm;
            const dy = Vy / norm;
            
            let newX = bacterium.position.x + this.stepSize * dx;
            let newY = bacterium.position.y + this.stepSize * dy;
            
            newX = Math.max(this.xRange[0], Math.min(this.xRange[1], newX));
            newY = Math.max(this.yRange[0], Math.min(this.yRange[1], newY));
            
            const newValue = this.func(newX, newY);
            
            bacterium.position = { x: newX, y: newY };
            bacterium.value = newValue;
            
            bacterium.health += bacterium.value;
            
            if (bacterium.value > this.bestValue) {
                this.bestValue = bacterium.value;
                this.bestPosition = { x: newX, y: newY };
                improved = true;
            }
        }
        
        if (improved) {
            this.stagnationCounter = 0;
        } else {
            this.stagnationCounter++;
        }
        
        return improved;
    }

    reproduction() {
        const indexed = [];
        for (let i = 0; i < this.bacteriaCount; i++) {
            indexed.push({ idx: i, health: this.bacteria[i].health });
        }
        indexed.sort((a, b) => b.health - a.health);
        
        const survivors = [];
        const halfCount = Math.floor(this.bacteriaCount / 2);
        for (let i = 0; i < halfCount; i++) {
            const idx = indexed[i].idx;
            survivors.push({
                position: { 
                    x: this.bacteria[idx].position.x, 
                    y: this.bacteria[idx].position.y 
                },
                value: this.bacteria[idx].value,
                health: 0
            });
        }
        
        const newBacteria = [];
        for (let i = 0; i < survivors.length; i++) {
            newBacteria.push({
                position: { x: survivors[i].position.x, y: survivors[i].position.y },
                value: survivors[i].value,
                health: 0
            });
            newBacteria.push({
                position: { x: survivors[i].position.x, y: survivors[i].position.y },
                value: survivors[i].value,
                health: 0
            });
        }
        
        this.bacteria = newBacteria;
    }

    eliminationAndDispersal() {

        const n = Math.floor(this.eliminationProb * this.bacteriaCount);
        
        if (n === 0) return;
        
        const indicesToEliminate = [];
        
        while (indicesToEliminate.length < n) {
            const idx = Math.floor(Math.random() * this.bacteriaCount);
            if (!indicesToEliminate.includes(idx)) {
                indicesToEliminate.push(idx);
            }
        }
        
        for (const idx of indicesToEliminate) {
            const x = this.xRange[0] + Math.random() * (this.xRange[1] - this.xRange[0]);
            const y = this.yRange[0] + Math.random() * (this.yRange[1] - this.yRange[0]);
            const value = this.func(x, y);
            
            this.bacteria[idx] = {
                position: { x, y },
                value: value,
                health: 0
            };
            
            if (value > this.bestValue) {
                this.bestValue = value;
                this.bestPosition = { x, y };
            }
        }
    }

    resetHealth() {
        for (let i = 0; i < this.bacteriaCount; i++) {
            this.bacteria[i].health = 0;
        }
    }

    checkStopConditions() {
        if (this.stagnationCounter >= this.stagnationLimit) {
            return true;
        }
        
        if (Math.abs(this.bestValue) < this.targetPrecision) {
            return true;
        }
        
        if (this.bestPosition && 
            Math.abs(this.bestPosition.x) < this.targetPrecision && 
            Math.abs(this.bestPosition.y) < this.targetPrecision) {
            return true;
        }
        
        return false;
    }

    async solve(onIteration, delay = 0) {
        this.reset();
        this.initPopulation();
        this.isRunning = true;
        this.totalIter = 0;
        
        if (onIteration) {
            onIteration({
                iteration: 0,
                chemotaxisStep: 0,
                reproductionStep: 0,
                eliminationStep: 0,
                bestValue: this.bestValue,
                bestPosition: this.bestPosition,
                bacteria: this.bacteria
            });
        }
        
        for (let l = 0; l < this.eliminationSteps && this.isRunning; l++) {
            this.currentElimStep = l + 1;
            
            for (let r = 0; r < this.reproductionSteps && this.isRunning; r++) {
                this.currentReproStep = r + 1;
                
                this.resetHealth();
                
                for (let t = 0; t < this.chemotaxisSteps && this.isRunning; t++) {
                    this.currentChemoStep = t + 1;
                    
                    this.chemotaxisStep();
                    this.totalIter++;
                    
                    if (onIteration) {
                        onIteration({
                            iteration: this.totalIter,
                            chemotaxisStep: this.currentChemoStep,
                            reproductionStep: this.currentReproStep,
                            eliminationStep: this.currentElimStep,
                            bestValue: this.bestValue,
                            bestPosition: this.bestPosition,
                            bacteria: this.bacteria
                        });
                    }
                    
                    if (this.checkStopConditions()) {
                        this.isRunning = false;
                        break;
                    }
                    
                    if (delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
                
                if (this.isRunning) {
                    this.reproduction();
                }
            }
            
            if (this.isRunning) {
                this.eliminationAndDispersal();
            }
        }
        
        this.isRunning = false;
        
        return {
            solution: this.bestPosition,
            value: this.bestValue,
            totalIterations: this.totalIter,
            history: this.history
        };
    }

    stop() {
        this.isRunning = false;
    }
}

let bfoSolver = null;
let bfoRunning = false;

function createBFOSurface(xRange, yRange, points = 60) {
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
            const val = bfoSphere(xi, yj);
            row.push(val);
        }
        z.push(row);
    }
    
    return { x, y, z };
}

function updateBFOFunctionInfo() {
    const funcInfo = document.getElementById('bfo-func-info');
    if (funcInfo) {
        funcInfo.innerHTML = 'f(x, y) = -(x^2 + y^2). Глобальный максимум: f(0, 0) = 0';
    }
}

async function startBFO() {
    if (bfoRunning) return;
    
    const bacteriaCount = parseInt(document.getElementById('bfo-bacteria-count').value) || 40;
    const chemotaxisSteps = parseInt(document.getElementById('bfo-chemotaxis-steps').value) || 50;
    const reproductionSteps = parseInt(document.getElementById('bfo-reproduction-steps').value) || 10;
    const eliminationSteps = parseInt(document.getElementById('bfo-elimination-steps').value) || 4;
    const stepSize = parseFloat(document.getElementById('bfo-step-size').value) || 0.1;
    const eliminationProb = parseFloat(document.getElementById('bfo-probability').value) || 0.25;
    const stagnationLimit = parseInt(document.getElementById('bfo-stagnation').value) || 50;
    const xMin = parseFloat(document.getElementById('bfo-x-min').value) || -5;
    const xMax = parseFloat(document.getElementById('bfo-x-max').value) || 5;
    const yMin = parseFloat(document.getElementById('bfo-y-min').value) || -5;
    const yMax = parseFloat(document.getElementById('bfo-y-max').value) || 5;
    const delay = parseInt(document.getElementById('bfo-delay').value) || 100;
    
    bfoSolver = new BacterialForagingOptimizer();
    
    bfoSolver.bacteriaCount = bacteriaCount % 2 === 0 ? bacteriaCount : bacteriaCount + 1;
    bfoSolver.chemotaxisSteps = chemotaxisSteps;
    bfoSolver.reproductionSteps = reproductionSteps;
    bfoSolver.eliminationSteps = eliminationSteps;
    bfoSolver.stepSize = stepSize;
    bfoSolver.eliminationProb = eliminationProb;
    bfoSolver.stagnationLimit = stagnationLimit;
    bfoSolver.xRange = [xMin, xMax];
    bfoSolver.yRange = [yMin, yMax];
    
    document.getElementById('bfo-start-btn').disabled = true;
    document.getElementById('bfo-stop-btn').disabled = false;
    document.getElementById('bfo-reset-btn').disabled = true;
    
    const logDiv = document.getElementById('bfo-log');
    logDiv.innerHTML = '';
    
    const surfaceData = createBFOSurface([xMin, xMax], [yMin, yMax], 60);
    
    const iterations = [];
    const values = [];
    let convergenceCreated = false;
    let swarmPlotCreated = false;
    
    const onIteration = (data) => {
        if (data.bestPosition) {
            document.getElementById('bfo-best-x').textContent = data.bestPosition.x.toFixed(8);
            document.getElementById('bfo-best-y').textContent = data.bestPosition.y.toFixed(8);
            document.getElementById('bfo-best-f').textContent = data.bestValue.toFixed(12);
        }
        
        document.getElementById('bfo-iter-count').textContent = data.iteration;
        document.getElementById('bfo-chemo-count').textContent = data.chemotaxisStep;
        document.getElementById('bfo-repro-count').textContent = data.reproductionStep;
        document.getElementById('bfo-elim-count').textContent = data.eliminationStep;
        
        iterations.push(data.iteration);
        values.push(data.bestValue);
        
        if (!convergenceCreated) {
            Plotly.newPlot('bfo-convergence-plot', [{
                x: iterations,
                y: values,
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#e74c3c', width: 2 },
                marker: { size: 3 },
                name: 'Best value'
            }], {
                title: 'BFO Convergence',
                xaxis: { title: 'Iteration' },
                yaxis: { title: 'f(x,y)' },
                plot_bgcolor: 'white',
                paper_bgcolor: 'white'
            });
            convergenceCreated = true;
        } else {
            Plotly.update('bfo-convergence-plot', 
                { x: [iterations], y: [values] },
                {}
            );
        }
        
        const bacteriaX = data.bacteria.map(b => b.position.x);
        const bacteriaY = data.bacteria.map(b => b.position.y);
        const bacteriaZ = data.bacteria.map(b => b.value);
        
        const colors = data.bacteria.map(b => {
            const t = (b.value + 50) / 50;
            const r = Math.floor(255 * (1 - t));
            const g = Math.floor(255 * t);
            return 'rgb(' + r + ',' + g + ',50)';
        });
        
        const sizes = data.bacteria.map(b => {
            const t = (b.value + 50) / 50;
            return 4 + t * 10;
        });
        
        if (swarmPlotCreated) {
            Plotly.purge('bfo-swarm-plot');
            swarmPlotCreated = false;
        }

        const traces = [
            {
                type: 'surface',
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                colorscale: [
                    [0, 'rgb(165,0,38)'],
                    [0.25, 'rgb(215,48,39)'],
                    [0.5, 'rgb(244,109,67)'],
                    [0.75, 'rgb(253,174,97)'],
                    [1, 'rgb(254,224,144)']
                ],
                opacity: 0.85,
                showscale: true,
                colorbar: { title: 'f(x,y)', len: 0.6 },
                name: 'f(x,y) = -(x^2+y^2)'
            },
            {
                type: 'scatter3d',
                x: bacteriaX,
                y: bacteriaY,
                z: bacteriaZ,
                mode: 'markers',
                marker: {
                    color: colors,
                    size: sizes,
                    opacity: 0.9,
                    symbol: 'circle',
                    line: { width: 1, color: 'white' }
                },
                name: 'Бактерии'
            },
            {
                type: 'scatter3d',
                x: [data.bestPosition.x],
                y: [data.bestPosition.y],
                z: [data.bestValue],
                mode: 'markers',
                marker: {
                    color: 'gold',
                    size: 12,
                    symbol: 'diamond',
                    line: { color: 'orange', width: 2 }
                },
                name: 'Лучшая бактерия'
            },
            {
                type: 'scatter3d',
                x: [0],
                y: [0],
                z: [0],
                mode: 'markers',
                marker: {
                    color: '#2ecc71',
                    size: 10,
                    symbol: 'circle',
                    line: { color: 'white', width: 2 }
                },
                name: 'Истинный max (0,0,0)'
            }
        ];

        Plotly.newPlot('bfo-swarm-plot', traces, {
            title: {
                text: 'BFO: Итерация ' + data.iteration,
                font: { size: 14, color: '#2c3e50' }
            },
            scene: {
                xaxis: { title: 'X', range: [xMin, xMax] },
                yaxis: { title: 'Y', range: [yMin, yMax] },
                zaxis: { title: 'f(x,y)', range: [-50, 5] },
                camera: { eye: { x: 1.8, y: 1.8, z: 1.5 } }
            },
            legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
            margin: { l: 0, r: 0, b: 0, t: 60 },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white'
        });
        swarmPlotCreated = true;
        
        if (data.iteration % 20 === 0 || data.iteration === 1) {
            const entry = document.createElement('div');
            entry.className = 'bfo-log-entry';
            entry.textContent = 'Итер ' + data.iteration + ' | Хемо: ' + data.chemotaxisStep + ' | Репр: ' + data.reproductionStep + ' | Ликв: ' + data.eliminationStep + ' | f(x,y) = ' + data.bestValue.toFixed(8);
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    };
    
    bfoRunning = true;
    const result = await bfoSolver.solve(onIteration, delay);
    bfoRunning = false;
    
    const finalEntry = document.createElement('div');
    finalEntry.className = 'bfo-log-entry';
    finalEntry.style.color = '#27ae60';
    finalEntry.style.fontWeight = 'bold';
    finalEntry.textContent = 'Завершено. x* = ' + result.solution.x.toFixed(10) + ', y* = ' + result.solution.y.toFixed(10) + ', f(x*,y*) = ' + result.value.toFixed(12) + ', Итераций: ' + result.totalIterations;
    logDiv.appendChild(finalEntry);
    logDiv.scrollTop = logDiv.scrollHeight;
    
    document.getElementById('bfo-start-btn').disabled = false;
    document.getElementById('bfo-stop-btn').disabled = true;
    document.getElementById('bfo-reset-btn').disabled = false;
}

function stopBFO() {
    if (bfoSolver) {
        bfoSolver.stop();
    }
    bfoRunning = false;
    document.getElementById('bfo-start-btn').disabled = false;
    document.getElementById('bfo-stop-btn').disabled = true;
    document.getElementById('bfo-reset-btn').disabled = false;
}

function resetBFO() {
    if (bfoRunning) stopBFO();
    
    document.getElementById('bfo-best-x').textContent = '-';
    document.getElementById('bfo-best-y').textContent = '-';
    document.getElementById('bfo-best-f').textContent = '-';
    document.getElementById('bfo-iter-count').textContent = '0';
    document.getElementById('bfo-chemo-count').textContent = '0';
    document.getElementById('bfo-repro-count').textContent = '0';
    document.getElementById('bfo-elim-count').textContent = '0';
    document.getElementById('bfo-log').innerHTML = '';
    
    Plotly.purge('bfo-convergence-plot');
    Plotly.purge('bfo-swarm-plot');
    
    const xMin = parseFloat(document.getElementById('bfo-x-min').value) || -5;
    const xMax = parseFloat(document.getElementById('bfo-x-max').value) || 5;
    const yMin = parseFloat(document.getElementById('bfo-y-min').value) || -5;
    const yMax = parseFloat(document.getElementById('bfo-y-max').value) || 5;
    
    Plotly.newPlot('bfo-convergence-plot', [{
        x: [], y: [], type: 'scatter', mode: 'lines+markers',
        line: { color: '#e74c3c', width: 2 }
    }], {
        title: 'Сходимость BFO',
        xaxis: { title: 'Итерация' },
        yaxis: { title: 'f(x,y)' },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white'
    });
    
    const surfaceData = createBFOSurface([xMin, xMax], [yMin, yMax], 60);
    
    const surfaceTrace = {
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: [
            [0, 'rgb(165,0,38)'],
            [0.25, 'rgb(215,48,39)'],
            [0.5, 'rgb(244,109,67)'],
            [0.75, 'rgb(253,174,97)'],
            [1, 'rgb(254,224,144)']
        ],
        opacity: 0.85,
        showscale: true,
        colorbar: { title: 'f(x,y)', len: 0.6 },
        name: 'f(x,y) = -(x^2+y^2)'
    };
    
    const trueMaxTrace = {
        type: 'scatter3d',
        x: [0], y: [0], z: [0],
        mode: 'markers',
        marker: {
            color: '#2ecc71',
            size: 10,
            symbol: 'circle',
            line: { color: 'white', width: 2 }
        },
        name: 'True max (0,0,0)'
    };
    
    Plotly.newPlot('bfo-swarm-plot', [surfaceTrace, trueMaxTrace], {
        title: {
            text: 'Бактериальная оптимизация (BFO)',
            font: { size: 14, color: '#2c3e50' }
        },
        scene: {
            xaxis: { title: 'X', range: [xMin, xMax] },
            yaxis: { title: 'Y', range: [yMin, yMax] },
            zaxis: { title: 'f(x,y)', range: [-50, 5] },
            camera: { eye: { x: 1.8, y: 1.8, z: 1.5 } }
        },
        legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
        margin: { l: 0, r: 0, b: 0, t: 60 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
    });
}

function initBFO() {
    const startBtn = document.getElementById('bfo-start-btn');
    const stopBtn = document.getElementById('bfo-stop-btn');
    const resetBtn = document.getElementById('bfo-reset-btn');
    
    if (startBtn) startBtn.onclick = function() { startBFO(); };
    if (stopBtn) stopBtn.onclick = function() { stopBFO(); };
    if (resetBtn) resetBtn.onclick = function() { resetBFO(); };
    
    updateBFOFunctionInfo();
    resetBFO();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBFO);
} else {
    initBFO();
}
