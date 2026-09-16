// متغيرات عامة
let currentDisplay = '';
let history = [];

// عناصر DOM
const display = document.getElementById('display');
const input = document.getElementById('input');
const historyDiv = document.getElementById('history');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');

// تحميل السجل من localStorage
window.addEventListener('load', () => {
    loadHistory();
});

// إضافة الأرقام
function appendNumber(num) {
    input.value += num;
    updateDisplay();
}

// إضافة العمليات
function appendOperator(op) {
    if (input.value && input.value[input.value.length - 1] !== ' ') {
        input.value += ' ' + op + ' ';
        updateDisplay();
    }
}

// إضافة الدوال الرياضية
function appendFunction(func) {
    switch(func) {
        case 'sqrt':
            input.value += 'sqrt(';
            break;
        case 'pow':
            input.value += '^';
            break;
        case 'sin':
            input.value += 'sin(';
            break;
        case 'cos':
            input.value += 'cos(';
            break;
        case 'tan':
            input.value += 'tan(';
            break;
        case 'log':
            input.value += 'log(';
            break;
        case 'pi':
            input.value += Math.PI.toFixed(4);
            break;
        case 'e':
            input.value += Math.E.toFixed(4);
            break;
    }
    updateDisplay();
}

// مسح الشاشة
function clearDisplay() {
    input.value = '';
    currentDisplay = '';
    display.value = '';
}

// حذف الرقم الأخير
function deleteLastChar() {
    input.value = input.value.slice(0, -1);
    updateDisplay();
}

// تبديل الإشارة
function toggleSign() {
    if (input.value && !isNaN(parseFloat(input.value))) {
        input.value = parseFloat(input.value) * -1;
        updateDisplay();
    }
}

// تحديث العرض
function updateDisplay() {
    display.value = input.value || '0';
}

// حساب النتيجة
function calculate() {
    try {
        let expression = input.value;
        
        if (!expression) {
            return;
        }

        // تحويل المتغيرات الرياضية
        expression = expression.replace(/π/g, Math.PI);
        expression = expression.replace(/e/g, Math.E);
        
        // دعم العمليات الرياضية
        expression = expression.replace(/\^/g, '**');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        expression = expression.replace(/sin\(/g, '(Math.sin(');
        expression = expression.replace(/\)/g, ')');
        expression = expression.replace(/cos\(/g, '(Math.cos(');
        expression = expression.replace(/\)/g, ')');
        expression = expression.replace(/tan\(/g, '(Math.tan(');
        expression = expression.replace(/\)/g, ')');
        expression = expression.replace(/log\(/g, '(Math.log10(');
        expression = expression.replace(/\)/g, ')');

        // حساب النتيجة
        let result = Function('"use strict"; return (' + expression + ')')();
        
        // التحقق من أن النتيجة رقم
        if (typeof result === 'number' && isFinite(result)) {
            // تقريب النتيجة
            result = Math.round(result * 1000000) / 1000000;
            
            input.value = result;
            display.value = result;
            
            // إضافة إلى السجل
            addToHistory(expression, result);
            
            // رسالة من المساعد الذكي
            addAIMessage('✓ تم حساب النتيجة: ' + result, 'assistant');
        } else {
            display.value = 'خطأ في الحساب';
        }
    } catch (error) {
        display.value = 'خطأ: ' + error.message;
        addAIMessage('⚠️ حدث خطأ: ' + error.message, 'assistant');
    }
}

// إضافة إلى السجل
function addToHistory(expression, result) {
    const item = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    
    history.unshift(item);
    
    // الاحتفاظ ب 20 عملية فقط
    if (history.length > 20) {
        history.pop();
    }
    
    saveHistory();
    displayHistory();
}

// عرض السجل
function displayHistory() {
    historyDiv.innerHTML = '';
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${item.expression} = ${item.result}`;
        historyItem.onclick = () => {
            input.value = item.result;
            updateDisplay();
        };
        historyDiv.appendChild(historyItem);
    });
}

// حفظ السجل
function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

// تحميل السجل
function loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
        history = JSON.parse(saved);
        displayHistory();
    }
}

// المساعد الذكي
function askAI() {
    const question = aiInput.value.trim();
    
    if (!question) {
        return;
    }
    
    // إضافة سؤال المستخدم
    addAIMessage(question, 'user');
    aiInput.value = '';
    
    // معالجة السؤال
    processAIQuestion(question);
}

// معالجة أسئلة المساعد الذكي
function processAIQuestion(question) {
    let response = '';
    
    // تحويل إلى أحرف صغيرة للمقارنة
    const q = question.toLowerCase();
    
    if (q.includes('كيف') || q.includes('ماذا') || q.includes('شرح')) {
        if (q.includes('الآلة') || q.includes('حاسبة')) {
            response = 'أنا آلة حاسبة ذكية متطورة! 🤖 يمكنني:\n• إجراء العمليات الحسابية الأساسية\n• حساب الدوال الرياضية (sin, cos, tan, log)\n• حفظ السجل التاريخي للعمليات\n• شرح الخطوات المختلفة';
        } else if (q.includes('جذر') || q.includes('sqrt')) {
            response = 'الجذر التربيعي يحسب رقماً عندما يُضرب في نفسه يعطي الرقم المطلوب. مثال: √9 = 3';
        } else if (q.includes('مثلثية') || q.includes('sin') || q.includes('cos')) {
            response = 'الدوال المثلثية (sin, cos, tan) تحسب النسب المثلثية في المثلثات قائمة الزاوية.';
        } else {
            response = 'هذا سؤال جيد! 🤔 يمكنك استخدام الآلة الحاسبة لإجراء العمليات الحسابية المختلفة.';
        }
    } else if (q.includes('ساعد') || q.includes('أيضاً') || q.includes('حل')) {
        response = 'بالتأكيد! 💡 يمكنني:\n• حل العمليات الحسابية المعقدة\n• شرح الخطوات\n• تخزين السجل\n• حساب الدوال الرياضية المتقدمة';
    } else if (q.includes('السجل') || q.includes('التاريخ')) {
        response = 'السجل يحفظ آخر 20 عملية! 📋 يمكنك النقر على أي عملية لاستخدام نتيجتها.';
    } else if (q.includes('أنت') || q.includes('من')) {
        response = 'أنا مساعدك الذكي! 🧠 تم تطويري لمساعدتك في الحسابات والعمليات الرياضية.';
    } else {
        response = 'سؤال ممتاز! 🌟 لا أملك إجابة محددة لهذا السؤال، لكن يمكنك تجربة العمليات الحسابية المختلفة!';
    }
    
    // تأخير بسيط للاستجابة
    setTimeout(() => {
        addAIMessage(response, 'assistant');
    }, 500);
}

// إضافة رسالة المساعد الذكي
function addAIMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message ' + sender;
    messageDiv.textContent = message;
    aiMessages.appendChild(messageDiv);
    
    // التمرير التلقائي لأسفل
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// الاستجابة لـ Enter في حقل الإدخال
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculate();
    }
});

// الاستجابة لـ Enter في حقل المساعد الذكي
aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        askAI();
    }
});

// رسالة ترحيب
window.addEventListener('load', () => {
    setTimeout(() => {
        addAIMessage('مرحباً! 👋 أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟', 'assistant');
    }, 500);
});
