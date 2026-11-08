// excel-table-import-final.js
/**
 * Excel Table Import Plugin для draw.io
 * Импорт таблиц через буфер обмена
 */

Draw.loadPlugin(function(ui) {
    
    var CELL_WIDTH = 100;
    var CELL_HEIGHT = 30;
    var START_X = 50;
    var START_Y = 50;
    
    ui.actions.addAction('importExcelTable', function() {
        showImportDialog();
    });
    
    var menu = ui.menus.get('extras');
    if (menu != null) {
        var oldFunct = menu.funct;
        menu.funct = function(menu, parent) {
            oldFunct.apply(this, arguments);
            ui.menus.addMenuItems(menu, ['-', 'importExcelTable'], parent);
        };
    }
    
    ui.actions.put('importExcelTable', new Action('Импорт таблицы из Excel', function() {
        showImportDialog();
    }));
    
    function showImportDialog() {
        var div = document.createElement('div');
        div.style.padding = '20px';
        div.style.maxWidth = '600px';
        
        var title = document.createElement('h3');
        title.innerHTML = '📊 Импорт таблицы из Excel';
        title.style.marginTop = '0';
        title.style.marginBottom = '20px';
        title.style.color = '#1976D2';
        div.appendChild(title);
        
        // Основная инструкция
        var mainInstruction = document.createElement('div');
        mainInstruction.style.padding = '15px';
        mainInstruction.style.border = '2px solid #4CAF50';
        mainInstruction.style.borderRadius = '8px';
        mainInstruction.style.backgroundColor = '#E8F5E9';
        mainInstruction.style.marginBottom = '20px';
        
        var steps = document.createElement('div');
        steps.innerHTML = 
            '<div style="font-weight:bold;margin-bottom:10px;font-size:14px;color:#2E7D32;">📋 Пошаговая инструкция:</div>' +
            '<ol style="margin:0;padding-left:25px;line-height:1.8;font-size:13px;">' +
            '<li>Откройте файл Excel</li>' +
            '<li>Выделите <strong>всю таблицу</strong> (включая заголовки)</li>' +
            '<li>Скопируйте: <kbd style="background:#fff;padding:2px 6px;border:1px solid #ccc;border-radius:3px;">Ctrl+C</kbd></li>' +
            '<li>Вставьте данные в поле ниже: <kbd style="background:#fff;padding:2px 6px;border:1px solid #ccc;border-radius:3px;">Ctrl+V</kbd></li>' +
            '<li>Нажмите "Импортировать"</li>' +
            '</ol>';
        mainInstruction.appendChild(steps);
        div.appendChild(mainInstruction);
        
        // Поле для вставки
        var textareaLabel = document.createElement('label');
        textareaLabel.innerHTML = '<strong>Вставьте данные из Excel:</strong>';
        textareaLabel.style.display = 'block';
        textareaLabel.style.marginBottom = '8px';
        textareaLabel.style.fontSize = '14px';
        div.appendChild(textareaLabel);
        
        var textarea = document.createElement('textarea');
        textarea.id = 'excelData';
        textarea.style.width = '100%';
        textarea.style.height = '200px';
        textarea.style.padding = '12px';
        textarea.style.fontFamily = 'Consolas, "Courier New", monospace';
        textarea.style.fontSize = '11px';
        textarea.style.border = '2px solid #2196F3';
        textarea.style.borderRadius = '6px';
        textarea.style.resize = 'vertical';
        textarea.style.backgroundColor = '#FAFAFA';
        textarea.placeholder = 
            'Вставьте сюда скопированные ячейки из Excel...\n\n' +
            'Пример:\n' +
            'Заголовок 1\tЗаголовок 2\tЗаголовок 3\n' +
            'Значение 1\tЗначение 2\tЗначение 3\n' +
            '\n(Между ячейками должна быть табуляция)';
        
        textarea.addEventListener('focus', function() {
            if (textarea.value === '') {
                textarea.placeholder = '✓ Готово к вставке! Нажмите Ctrl+V...';
            }
        });
        
        textarea.addEventListener('paste', function() {
            setTimeout(function() {
                var lines = textarea.value.split('\n').filter(function(l) { return l.trim(); }).length;
                if (lines > 0) {
                    var info = document.getElementById('pasteInfo');
                    if (info) {
                        info.style.display = 'block';
                        info.innerHTML = 
                            '<span style="color:#2E7D32;font-weight:bold;">✓</span> ' +
                            'Данные вставлены! Обнаружено строк: <strong>' + lines + '</strong>';
                    }
                }
            }, 100);
        });
        
        div.appendChild(textarea);
        
        // Информация о вставленных данных
        var pasteInfo = document.createElement('div');
        pasteInfo.id = 'pasteInfo';
        pasteInfo.style.marginTop = '8px';
        pasteInfo.style.padding = '8px 12px';
        pasteInfo.style.backgroundColor = '#E8F5E9';
        pasteInfo.style.border = '1px solid #4CAF50';
        pasteInfo.style.borderRadius = '4px';
        pasteInfo.style.fontSize = '13px';
        pasteInfo.style.display = 'none';
        div.appendChild(pasteInfo);
        
        // Подсказка
        var hint = document.createElement('div');
        hint.style.marginTop = '15px';
        hint.style.padding = '10px';
        hint.style.backgroundColor = '#FFF3E0';
        hint.style.border = '1px solid #FFB74D';
        hint.style.borderRadius = '4px';
        hint.style.fontSize = '12px';
        hint.innerHTML = 
            '<strong>💡 Важно:</strong> При копировании из Excel данные автоматически разделяются ' +
            'табуляцией между ячейками. Не изменяйте вставленные данные вручную!';
        div.appendChild(hint);
        
        // Настройки
        var settingsGroup = createSettingsPanel();
        div.appendChild(settingsGroup);
        
        // Кнопки
        var buttons = document.createElement('div');
        buttons.style.marginTop = '20px';
        buttons.style.display = 'flex';
        buttons.style.gap = '10px';
        buttons.style.justifyContent = 'flex-end';
        
        var cancelBtn = mxUtils.button('Отмена', function() {
            ui.hideDialog();
        });
        cancelBtn.className = 'geBtn';
        cancelBtn.style.padding = '8px 20px';
        
        var importBtn = mxUtils.button('🚀 Импортировать', function() {
            var data = document.getElementById('excelData').value;
            
            if (!data || data.trim() === '') {
                ui.showError('Ошибка', 
                    'Пожалуйста, вставьте данные из Excel.\n\n' +
                    '1. Откройте Excel\n' +
                    '2. Выделите таблицу\n' +
                    '3. Скопируйте (Ctrl+C)\n' +
                    '4. Вставьте в поле выше (Ctrl+V)', 
                    'OK');
                return;
            }
            
            var options = getOptions();
            ui.hideDialog();
            importFromPaste(data, options);
        });
        importBtn.className = 'geBtn gePrimaryBtn';
        importBtn.style.padding = '8px 20px';
        importBtn.style.fontWeight = 'bold';
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(importBtn);
        div.appendChild(buttons);
        
        ui.showDialog(div, 650, 700, true, false);
        
        setTimeout(function() {
            textarea.focus();
        }, 100);
    }
    
    function createSettingsPanel() {
        var settingsGroup = document.createElement('div');
        settingsGroup.style.marginTop = '20px';
        settingsGroup.style.padding = '15px';
        settingsGroup.style.border = '1px solid #E0E0E0';
        settingsGroup.style.borderRadius = '6px';
        settingsGroup.style.backgroundColor = '#FAFAFA';
        
        var settingsTitle = document.createElement('div');
        settingsTitle.innerHTML = '<strong>⚙️ Параметры импорта</strong>';
        settingsTitle.style.marginBottom = '12px';
        settingsTitle.style.fontSize = '14px';
        settingsTitle.style.color = '#424242';
        settingsGroup.appendChild(settingsTitle);
        
        var sizeRow = document.createElement('div');
        sizeRow.style.display = 'grid';
        sizeRow.style.gridTemplateColumns = '1fr 1fr';
        sizeRow.style.gap = '15px';
        sizeRow.style.marginBottom = '12px';
        
        sizeRow.appendChild(createInput('cellWidth', 'Ширина ячейки (px):', CELL_WIDTH, 30, 500));
        sizeRow.appendChild(createInput('cellHeight', 'Высота ячейки (px):', CELL_HEIGHT, 20, 200));
        settingsGroup.appendChild(sizeRow);
        
        var optionsGroup = document.createElement('div');
        optionsGroup.style.display = 'grid';
        optionsGroup.style.gridTemplateColumns = '1fr 1fr';
        optionsGroup.style.gap = '8px';
        
        optionsGroup.appendChild(createCheckbox('showBorders', 'Границы ячеек', true));
        optionsGroup.appendChild(createCheckbox('groupCells', 'Группировать таблицу', true));
        optionsGroup.appendChild(createCheckbox('highlightHeader', 'Выделить заголовки', true));
        optionsGroup.appendChild(createCheckbox('autoWidth', 'Авто-ширина', true));
        
        settingsGroup.appendChild(optionsGroup);
        
        return settingsGroup;
    }
    
    function createInput(id, label, value, min, max) {
        var group = document.createElement('div');
        
        var labelElem = document.createElement('label');
        labelElem.innerHTML = label;
        labelElem.style.display = 'block';
        labelElem.style.marginBottom = '5px';
        labelElem.style.fontSize = '12px';
        labelElem.style.fontWeight = '500';
        labelElem.style.color = '#616161';
        
        var input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.value = value;
        input.style.width = '100%';
        input.style.padding = '6px 10px';
        input.style.border = '1px solid #BDBDBD';
        input.style.borderRadius = '4px';
        input.style.fontSize = '13px';
        input.min = min;
        input.max = max;
        
        group.appendChild(labelElem);
        group.appendChild(input);
        
        return group;
    }
    
    function createCheckbox(id, label, checked) {
        var wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.padding = '4px 0';
        
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.style.marginRight = '8px';
        checkbox.style.cursor = 'pointer';
        checkbox.style.width = '16px';
        checkbox.style.height = '16px';
        
        var labelElem = document.createElement('label');
        labelElem.htmlFor = id;
        labelElem.innerHTML = label;
        labelElem.style.cursor = 'pointer';
        labelElem.style.fontSize = '13px';
        labelElem.style.userSelect = 'none';
        labelElem.style.color = '#424242';
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(labelElem);
        
        return wrapper;
    }
    
    function getOptions() {
        return {
            cellWidth: parseInt(document.getElementById('cellWidth').value) || CELL_WIDTH,
            cellHeight: parseInt(document.getElementById('cellHeight').value) || CELL_HEIGHT,
            groupCells: document.getElementById('groupCells').checked,
            showBorders: document.getElementById('showBorders').checked,
            highlightHeader: document.getElementById('highlightHeader').checked,
            autoWidth: document.getElementById('autoWidth').checked
        };
    }
    
    function importFromPaste(data, options) {
        try {
            var table = parseTableData(data);
            
            if (table.length === 0) {
                ui.showError('Ошибка', 
                    'Не удалось распознать данные таблицы.\n\n' +
                    'Проверьте:\n' +
                    '• Скопированы ли данные из Excel (не из текстового редактора)\n' +
                    '• Есть ли табуляция между ячейками\n' +
                    '• Не пустое ли поле для вставки', 
                    'OK');
                return;
            }
            
            table = normalizeTable(table);
            
            var columnWidths = null;
            if (options.autoWidth) {
                columnWidths = calculateColumnWidths(table, 60, 400);
            }
            
            createDrawioTable(table, options, columnWidths);
            
            var rowCount = table.length;
            var colCount = table[0].length;
            var cellCount = rowCount * colCount;
            
            ui.alert(
                '✅ Таблица успешно импортирована!\n\n' +
                '📊 Статистика:\n' +
                '  • Строк: ' + rowCount + '\n' +
                '  • Столбцов: ' + colCount + '\n' +
                '  • Всего ячеек: ' + cellCount + '\n\n' +
                '💡 Таблица ' + (options.groupCells ? 'сгруппирована' : 'не сгруппирована') + 
                ' и готова к использованию!'
            );
            
        } catch (error) {
            console.error('Import error:', error);
            ui.showError('Ошибка импорта', 
                'Произошла ошибка при импорте:\n\n' + error.message + '\n\n' +
                'Попробуйте:\n' +
                '• Скопировать таблицу заново\n' +
                '• Убедиться, что выделены все ячейки\n' +
                '• Проверить формат данных', 
                'OK');
        }
    }
    
    function parseTableData(data) {
        var lines = data.split(/\r?\n/);
        var table = [];
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            
            if (line.trim() === '' && table.length > 0 && i === lines.length - 1) {
                continue;
            }
            
            if (line === '' && table.length > 0) {
                table.push(['']);
                continue;
            }
            
            if (line.trim() === '' && table.length === 0) {
                continue;
            }
            
            var cells = line.split('\t');
            
            for (var j = 0; j < cells.length; j++) {
                cells[j] = cells[j].replace(/^\s+|\s+$/g, '');
            }
            
            table.push(cells);
        }
        
        return table;
    }
    
    function normalizeTable(table) {
        if (table.length === 0) return table;
        
        var maxCols = 0;
        for (var i = 0; i < table.length; i++) {
            if (table[i].length > maxCols) {
                maxCols = table[i].length;
            }
        }
        
        for (var i = 0; i < table.length; i++) {
            while (table[i].length < maxCols) {
                table[i].push('');
            }
        }
        
        return table;
    }
    
    function calculateColumnWidths(table, minWidth, maxWidth) {
        if (table.length === 0) return [];
        
        var colCount = table[0].length;
        var widths = [];
        
        for (var col = 0; col < colCount; col++) {
            var maxLength = 0;
            
            for (var row = 0; row < table.length; row++) {
                var cellText = (table[row][col] || '').toString();
                
                var lines = cellText.split('\n');
                for (var l = 0; l < lines.length; l++) {
                    if (lines[l].length > maxLength) {
                        maxLength = lines[l].length;
                    }
                }
            }
            
            var width = Math.max(minWidth, Math.min(maxWidth, maxLength * 7 + 30));
            widths.push(Math.round(width));
        }
        
        return widths;
    }
    
    function createDrawioTable(table, options, columnWidths) {
        var graph = ui.editor.graph;
        var parent = graph.getDefaultParent();
        
        var defaultCellWidth = options.cellWidth;
        var cellHeight = options.cellHeight;
        
        graph.getModel().beginUpdate();
        try {
            var cells = [];
            var rowCount = table.length;
            var colCount = table[0].length;
            
            for (var row = 0; row < rowCount; row++) {
                var currentX = START_X;
                
                for (var col = 0; col < colCount; col++) {
                    var cellWidth = columnWidths ? columnWidths[col] : defaultCellWidth;
                    var y = START_Y + (row * cellHeight);
                    
                    var value = (table[row][col] || '').toString();
                    
                    var lines = value.split('\n');
                    var actualHeight = lines.length > 1 ? cellHeight * Math.min(lines.length, 4) : cellHeight;
                    
                    var style = buildCellStyle(row, col, value, options);
                    
                    var vertex = graph.insertVertex(
                        parent,
                        null,
                        value,
                        currentX,
                        y,
                        cellWidth,
                        actualHeight,
                        style
                    );
                    
                    cells.push(vertex);
                    currentX += cellWidth;
                }
            }
            
            if (options.groupCells && cells.length > 1) {
                graph.setSelectionCells(cells);
                var group = graph.groupCells(null, 0);
                graph.setSelectionCell(group);
            } else if (cells.length > 0) {
                graph.setSelectionCells(cells);
            }
            
        } finally {
            graph.getModel().endUpdate();
        }
    }
    
    function buildCellStyle(row, col, value, options) {
        var style = 'rounded=0;whiteSpace=wrap;html=1;overflow=hidden;';
        
        // Границы
        if (options.showBorders) {
            style += 'strokeColor=#000000;strokeWidth=1;';
        } else {
            style += 'strokeColor=none;';
        }
        
        // Цвета и шрифты - ВСЕ ячейки с ЧЁРНЫМ текстом
        if (row === 0 && options.highlightHeader) {
            // Первая строка заголовка - светло-серый фон
            style += 'fillColor=#FFFFFF;fontColor=#000000;fontStyle=1;fontSize=11;';
        } else if (row === 1 && options.highlightHeader) {
            // Вторая строка заголовка - ещё светлее
            style += 'fillColor=#FFFFFF;fontColor=#000000;fontStyle=1;fontSize=10;';
        } else {
            // Обычные ячейки - белый фон, чёрный текст
            style += 'fillColor=#FFFFFF;fontColor=#000000;fontSize=10;';
        }
        
        // ВСЁ выравнивание ПО ЦЕНТРУ
        style += 'align=center;verticalAlign=middle;';
        
        // Отступы
        style += 'spacingLeft=6;spacingRight=6;spacingTop=4;spacingBottom=4;';
        
        return style;
    }
    
});