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
            
            const pathX = path.map(p => p.x);
            const pathY = path.map(p => p.y);
            const pathZ = path.map(p => p.z);
            
            const lastPoint = path[path.length - 1];
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
                
                if (dx < epsilon2 && dy < epsilon2 && dz < epsilon2) break;
                
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

        // Обработчики событий
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

        // Инициализация
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