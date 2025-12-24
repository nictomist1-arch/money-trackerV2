// === MoonGod Tracker - Космический финансовый менеджер ===

const API_URL = window.location.origin + '/api/v1';
let currentPage = 0;
const pageSize = 10;
let hasMore = true;
let chartInstance = null;
let transactionToDelete = null;

// === ПРЕДУСТАНОВЛЕННЫЕ КАТЕГОРИИ ===
const defaultCategories = [
    // Расходы
    { id: 1, name: 'Еда', type: 'expense', icon: '🍕', color: '#ef4444' },
    { id: 2, name: 'Транспорт', type: 'expense', icon: '🚗', color: '#f59e0b' },
    { id: 3, name: 'Развлечения', type: 'expense', icon: '🎬', color: '#8b5cf6' },
    { id: 4, name: 'Подарки', type: 'expense', icon: '🎁', color: '#ec4899' },
    { id: 5, name: 'Здоровье', type: 'expense', icon: '💊', color: '#10b981' },
    { id: 6, name: 'Образование', type: 'expense', icon: '📚', color: '#3b82f6' },
    { id: 7, name: 'Счета', type: 'expense', icon: '📄', color: '#6b7280' },
    { id: 8, name: 'Покупки', type: 'expense', icon: '🛍️', color: '#8b5cf6' },
    
    // Доходы
    { id: 9, name: 'Зарплата', type: 'income', icon: '💰', color: '#10b981' },
    { id: 10, name: 'Фриланс', type: 'income', icon: '💻', color: '#3b82f6' },
    { id: 11, name: 'Инвестиции', type: 'income', icon: '📈', color: '#8b5cf6' },
    { id: 12, name: 'Подарки', type: 'income', icon: '🎁', color: '#ec4899' }
];

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log('🚀 MoonTracker запущен');
    
    // Инициализация UI
    initUI();
    
    // Загрузка данных
    checkStatus();
    loadStats();
    loadCategories();
    loadTransactions();
    
    // Настройка обработчиков
    setupEventListeners();
    
    // Запуск анимаций
    startAnimations();
}

// === UI ИНИЦИАЛИЗАЦИЯ ===
function initUI() {
    // Селекторы типов транзакций
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.type-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            const type = this.dataset.type;
            document.querySelector(`input[name="type"][value="${type}"]`).checked = true;
            
            // Автоматически обновляем категории
            updateCategorySelection(type);
        });
    });
    
    // Инициализация быстрых действий
    setupQuickActions();
    
    // Обновление времени
    updateTime();
    setInterval(updateTime, 1000);
}

// === БЫСТРЫЕ ДЕЙСТВИЯ ===
function setupQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.dataset.amount;
            const description = this.dataset.description || this.querySelector('span').textContent;
            
            // Устанавливаем значения
            document.getElementById('amount').value = amount;
            document.getElementById('description').value = description;
            
            // Автоматически определяем тип по иконке
            const icon = this.querySelector('i').className;
            if (['fa-coffee', 'fa-utensils', 'fa-shopping-cart', 'fa-gift'].some(i => icon.includes(i))) {
                document.querySelector('.type-option[data-type="expense"]').click();
                
                // Автоматически выбираем соответствующую категорию
                switch(description) {
                    case 'Кофе':
                        setCategoryByText('Еда');
                        break;
                    case 'Обед':
                        setCategoryByText('Еда');
                        break;
                    case 'Покупки':
                        setCategoryByText('Покупки');
                        break;
                    case 'Подарок':
                        setCategoryByText('Подарки');
                        break;
                }
            }
            
            // Фокус на поле суммы
            document.getElementById('amount').focus();
        });
    });
}

function setCategoryByText(text) {
    const categorySelect = document.getElementById('category_id');
    const options = categorySelect.options;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].textContent.includes(text)) {
            categorySelect.selectedIndex = i;
            break;
        }
    }
}

// === АНИМАЦИИ ===
function startAnimations() {
    // Анимация пульсации для статусов
    setInterval(() => {
        const indicator = document.getElementById('status-indicator');
        indicator.style.animation = 'none';
        setTimeout(() => {
            indicator.style.animation = 'glow 2s infinite';
        }, 10);
    }, 4000);
}

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU');
    const date = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

// === ПРОВЕРКА СТАТУСА ===
async function checkStatus() {
    try {
        // Проверка API
        const healthResponse = await fetch('/health');
        if (healthResponse.ok) {
            document.getElementById('api-status').textContent = 'ONLINE';
            document.getElementById('api-status').style.color = '#10b981';
        } else {
            document.getElementById('api-status').textContent = 'ERROR';
            document.getElementById('api-status').style.color = '#ef4444';
        }
        
        // Проверка БД
        const dbResponse = await fetch(`${API_URL}/db/check`);
        if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            document.getElementById('db-status').textContent = 'CONNECTED';
            document.getElementById('db-status').style.color = '#10b981';
        } else {
            document.getElementById('db-status').textContent = 'ERROR';
            document.getElementById('db-status').style.color = '#ef4444';
        }
    } catch (error) {
        console.error('Status check error:', error);
        document.getElementById('api-status').textContent = 'OFFLINE';
        document.getElementById('api-status').style.color = '#ef4444';
        document.getElementById('db-status').textContent = 'ERROR';
        document.getElementById('db-status').style.color = '#ef4444';
    }
}

// === СТАТИСТИКА ===
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        // Обновление значений
        document.getElementById('total-income').textContent = 
            `${formatCurrency(stats.total_income)}`;
        document.getElementById('total-expense').textContent = 
            `${formatCurrency(stats.total_expense)}`;
        
        const balanceElement = document.getElementById('balance');
        const balanceCard = document.getElementById('balance-card');
        const balanceIcon = balanceCard.querySelector('.stat-icon i');
        
        // Обновляем баланс
        balanceElement.textContent = `${formatCurrency(stats.balance)}`;
        
        // Обновляем цвет и стиль баланса
        if (stats.balance > 0) {
            balanceElement.className = 'stat-value balance-positive';
            balanceCard.className = 'stat-card glow-green';
            balanceIcon.className = 'fas fa-arrow-up';
            balanceCard.querySelector('.stat-change').textContent = 'PROFIT';
        } else if (stats.balance < 0) {
            balanceElement.className = 'stat-value balance-negative';
            balanceCard.className = 'stat-card glow-red';
            balanceIcon.className = 'fas fa-arrow-down';
            balanceCard.querySelector('.stat-change').textContent = 'LOSS';
        } else {
            balanceElement.className = 'stat-value balance-neutral';
            balanceCard.className = 'stat-card glow-blue';
            balanceIcon.className = 'fas fa-balance-scale';
            balanceCard.querySelector('.stat-change').textContent = 'NET';
        }
        
        // Обновление счетчика транзакций
        document.getElementById('transactions-count').textContent = 
            stats.transactions.total_count;
        
        // Обновление диаграммы
        updateAdvancedChart();
        
        // Анимация обновления
        animateValueUpdate();
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value) + ' ₽';
}

function animateValueUpdate() {
    const values = document.querySelectorAll('.stat-value');
    values.forEach(value => {
        value.style.transform = 'scale(1.1)';
        setTimeout(() => {
            value.style.transform = 'scale(1)';
        }, 300);
    });
}

// === ДИАГРАММА ===
async function updateAdvancedChart() {
    try {
        const response = await fetch(`${API_URL}/stats/detailed`);
        const stats = await response.json();
        
        const ctx = document.getElementById('moon-chart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // Создаем данные для диаграммы по категориям
        const categories = stats.category_stats || [];
        
        if (categories.length === 0) {
            // Если нет данных по категориям, используем простую диаграмму
            updateSimpleChart(stats.totals.income, stats.totals.expense);
            return;
        }
        
        const categoryLabels = categories.map(cat => cat.category);
        const incomeData = categories.map(cat => cat.type === 'income' ? cat.total : 0);
        const expenseData = categories.map(cat => cat.type === 'expense' ? cat.total : 0);
        
        // Цвета для категорий
        const categoryColors = [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
        ];
        
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categoryLabels,
                datasets: [
                    {
                        label: 'Доходы',
                        data: incomeData,
                        backgroundColor: categoryColors,
                        borderColor: categoryColors.map(c => c.replace('0.8', '1')),
                        borderWidth: 1,
                        borderRadius: 5
                    },
                    {
                        label: 'Расходы',
                        data: expenseData,
                        backgroundColor: categoryColors.map(c => 
                            c.replace(')', ', 0.5)').replace('rgb', 'rgba')
                        ),
                        borderColor: categoryColors,
                        borderWidth: 1,
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e0e0ff',
                            font: {
                                family: 'Space Grotesk',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const label = context.dataset.label;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a5b4fc',
                            font: {
                                family: 'Space Grotesk',
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#a5b4fc',
                            font: {
                                family: 'Space Grotesk',
                                size: 11
                            },
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading advanced chart:', error);
        // Используем простую диаграмму как запасной вариант
        const response = await fetch(`${API_URL}/stats`);
        const simpleStats = await response.json();
        updateSimpleChart(simpleStats.total_income, simpleStats.total_expense);
    }
}

function updateSimpleChart(income, expense) {
    const ctx = document.getElementById('moon-chart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const total = income + expense;
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Доходы', 'Расходы'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#0da271', '#dc2626'],
                borderWidth: 2,
                borderRadius: 10,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e0e0ff',
                        font: {
                            family: 'Space Grotesk',
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = total > 0 ? (value / total * 100) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percent.toFixed(1)}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

// === КАТЕГОРИИ ===
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        let categories = defaultCategories;
        
        if (response.ok) {
            const serverCategories = await response.json();
            // Если есть категории с сервера, используем их
            if (serverCategories && serverCategories.length > 0) {
                categories = serverCategories;
            }
        }
        
        renderCategorySelects(categories);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        // Используем локальные категории при ошибке
        renderCategorySelects(defaultCategories);
    }
}

function renderCategorySelects(categories) {
    const categorySelect = document.getElementById('category_id');
    const filterCategory = document.getElementById('filter-category');
    
    // Очищаем селекты
    categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
    if (filterCategory) {
        filterCategory.innerHTML = '<option value="">Все категории</option>';
    }
    
    // Группируем по типам
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    // Добавляем категории доходов
    if (incomeCategories.length > 0) {
        const incomeGroup = document.createElement('optgroup');
        incomeGroup.label = '📈 Доходы';
        incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon || '📊'} ${category.name}`;
            option.dataset.type = category.type;
            if (category.color) {
                option.style.color = category.color;
            }
            incomeGroup.appendChild(option);
        });
        categorySelect.appendChild(incomeGroup);
    }
    
    // Добавляем категории расходов
    if (expenseCategories.length > 0) {
        const expenseGroup = document.createElement('optgroup');
        expenseGroup.label = '📉 Расходы';
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon || '📊'} ${category.name}`;
            option.dataset.type = category.type;
            if (category.color) {
                option.style.color = category.color;
            }
            expenseGroup.appendChild(option);
        });
        categorySelect.appendChild(expenseGroup);
    }
    
    // Для фильтра категорий
    if (filterCategory) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon || '📊'} ${category.name}`;
            filterCategory.appendChild(option);
        });
    }
}

function updateCategorySelection(type) {
    const categorySelect = document.getElementById('category_id');
    const options = categorySelect.querySelectorAll('option');
    
    // Сбрасываем выбор
    categorySelect.value = '';
    
    // Ищем первую категорию соответствующего типа
    options.forEach(option => {
        if (option.dataset.type === type && !categorySelect.value) {
            categorySelect.value = option.value;
        }
    });
}

// === ЗАПОЛНЕНИЕ КАТЕГОРИЙ ===
async function seedCategories() {
    if (!confirm('Заполнить базу данных предустановленными категориями?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/categories/seed`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('✅ Категории успешно добавлены!', 'success');
            loadCategories(); // Перезагружаем список
        } else {
            showNotification('❌ Ошибка при добавлении категорий', 'error');
        }
    } catch (error) {
        console.error('Error seeding categories:', error);
        showNotification('❌ Ошибка соединения', 'error');
    }
}

// === ТРАНЗАКЦИИ ===
async function loadTransactions(reset = true) {
    if (reset) {
        currentPage = 0;
        hasMore = true;
        document.getElementById('transactions-list').innerHTML = 
            '<div class="empty-state"><i class="fas fa-rocket"></i><p>Загрузка транзакций...</p></div>';
    }
    
    if (!hasMore) return;
    
    const filterType = document.getElementById('filter-type').value;
    const filterCategory = document.getElementById('filter-category').value;
    
    let endpoint = `${API_URL}/transactions?skip=${currentPage * pageSize}&limit=${pageSize}`;
    if (filterType) {
        endpoint += `&type=${filterType}`;
    }
    
    try {
        const response = await fetch(endpoint);
        const transactions = await response.json();
        
        const container = document.getElementById('transactions-list');
        
        if (reset) {
            container.innerHTML = '';
        }
        
        if (!transactions || transactions.length === 0) {
            if (reset) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-rocket"></i>
                        <p>Пока нет транзакций</p>
                        <small>Добавьте первую запись</small>
                    </div>
                `;
            }
            hasMore = false;
            document.getElementById('load-more').style.display = 'none';
            return;
        }
        
        // Рендерим транзакции
        transactions.forEach(transaction => {
            const item = createTransactionElement(transaction);
            container.appendChild(item);
        });
        
        currentPage++;
        hasMore = transactions.length === pageSize;
        document.getElementById('load-more').style.display = hasMore ? 'flex' : 'none';
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactions-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки</p>
                <small>Попробуйте обновить страницу</small>
            </div>
        `;
    }
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    
    const date = new Date(transaction.created_at);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const isIncome = transaction.type === 'income';
    const amountClass = isIncome ? 'transaction-income' : 'transaction-expense';
    const amountPrefix = isIncome ? '+' : '-';
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-description">
                ${transaction.description || 'Без описания'}
            </div>
            <div class="transaction-meta">
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                ${transaction.category_id ? '<span><i class="fas fa-tag"></i> Категория</span>' : ''}
            </div>
        </div>
        <div class="transaction-amount ${amountClass}">
            ${amountPrefix}${Math.abs(transaction.amount).toFixed(2)} ₽
        </div>
        <button class="delete-btn" onclick="showDeleteModal(${transaction.id})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return div;
}

function loadMore() {
    loadTransactions(false);
}

// === СОЗДАНИЕ ТРАНЗАКЦИИ ===
document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const categoryId = document.getElementById('category_id').value || null;
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Введите корректную сумму', 'error');
        return;
    }
    
    const transactionData = {
        amount: amount,
        description: description,
        type: type,
        category_id: categoryId
    };
    
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });
        
        if (response.ok) {
            showNotification('✅ Транзакция добавлена!', 'success');
            
            // Сброс формы
            document.getElementById('transaction-form').reset();
            document.querySelector('.type-option[data-type="income"]').click();
            
            // Обновление данных
            loadStats();
            loadTransactions(true);
            
            // Анимация успеха
            const btn = document.querySelector('.moon-btn.primary');
            btn.innerHTML = '<i class="fas fa-check"></i><span>УСПЕШНО!</span>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-paper-plane"></i><span>ОТПРАВИТЬ В КОСМОС</span>';
            }, 2000);
            
        } else {
            const error = await response.json();
            showNotification(`❌ Ошибка: ${error.detail || 'Неизвестная ошибка'}`, 'error');
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        showNotification('❌ Ошибка соединения с сервером', 'error');
    }
});

// === УДАЛЕНИЕ ТРАНЗАКЦИИ ===
function showDeleteModal(transactionId) {
    transactionToDelete = transactionId;
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex';
    
    // Можно добавить предпросмотр транзакции
    const preview = document.getElementById('transaction-preview');
    preview.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <strong>Транзакция #${transactionId}</strong>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 5px;">
                    Будет удалена безвозвратно
                </div>
            </div>
            <div style="color: #ef4444; font-size: 24px;">
                <i class="fas fa-exclamation-circle"></i>
            </div>
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'none';
    transactionToDelete = null;
}

document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!transactionToDelete) return;
    
    try {
        const response = await fetch(`${API_URL}/transactions/${transactionToDelete}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('🗑️ Транзакция удалена', 'info');
            loadStats();
            loadTransactions(true);
            closeModal();
        } else {
            showNotification('❌ Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showNotification('❌ Ошибка соединения', 'error');
    }
});

// === УВЕДОМЛЕНИЯ ===
function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                    type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                    'rgba(59, 130, 246, 0.9)'};
        backdrop-filter: blur(10px);
        border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
                         type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                         'rgba(59, 130, 246, 0.3)'};
        border-radius: 10px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 400px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        color: white;
        font-family: 'Space Grotesk', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Добавляем стили анимации
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: rgba(255,255,255,0.7);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .notification-close:hover {
                color: white;
                transform: rotate(90deg);
            }
        `;
        document.head.appendChild(style);
    }
}

// === НАСТРОЙКА ОБРАБОТЧИКОВ ===
function setupEventListeners() {
    // Закрытие модалки по клику вне
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('delete-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие модалки по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Периодическая проверка статуса
    setInterval(checkStatus, 30000);
    
    // Обновление категорий при смене фильтров
    document.getElementById('filter-type').addEventListener('change', () => {
        loadTransactions(true);
    });
    
    document.getElementById('filter-category').addEventListener('change', () => {
        loadTransactions(true);
    });
}

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
window.loadStats = loadStats;
window.loadTransactions = loadTransactions;
window.loadMore = loadMore;
window.showDeleteModal = showDeleteModal;
window.closeModal = closeModal;
window.seedCategories = seedCategories;

console.log('🌙 MoonGod Tracker готов к работе!');