document.addEventListener('DOMContentLoaded', function() {
    // Categorias de transações
    const categories = {
        income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
        expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Outros']
    };

    // Elementos do DOM
    const transactionForm = document.getElementById('transaction-form');
    const transactionType = document.getElementById('transaction-type');
    const transactionCategory = document.getElementById('transaction-category');
    const transactionAmount = document.getElementById('transaction-amount');
    const transactionDescription = document.getElementById('transaction-description');
    const transactionDate = document.getElementById('transaction-date');
    const transactionsList = document.getElementById('transactions-list');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const filterMonth = document.getElementById('filter-month');
    const currentBalance = document.getElementById('current-balance');
    const incomeValue = document.querySelector('.income-value');
    const expenseValue = document.querySelector('.expense-value');
    const goalAmount = document.getElementById('goal-amount');
    const setGoalBtn = document.getElementById('set-goal-btn');
    const goalProgress = document.getElementById('goal-progress');
    const goalText = document.getElementById('goal-text');
    const monthDisplay = document.querySelector('.month-display');

    // Gráficos
    let expensesChart = null;
    let balanceChart = null;

    // Inicializa o aplicativo
    init();

    function init() {
        // Configura a data atual como padrão
        const today = new Date();
        transactionDate.valueAsDate = today;
        
        // Atualiza o display do mês
        updateMonthDisplay();
        
        // Carrega transações e meta do LocalStorage
        loadTransactions();
        loadGoal();
        
        // Atualiza a interface
        updateUI();
        
        // Configura os listeners
        setupEventListeners();
        
        // Popula os selects de categoria
        populateCategorySelects();
    }

    function setupEventListeners() {
        // Formulário de transação
        transactionForm.addEventListener('submit', addTransaction);
        
        // Filtros
        filterType.addEventListener('change', updateUI);
        filterCategory.addEventListener('change', updateUI);
        filterMonth.addEventListener('change', updateUI);
        
        // Meta
        setGoalBtn.addEventListener('click', setGoal);
        
        // Atualiza categorias quando o tipo muda
        transactionType.addEventListener('change', function() {
            populateTransactionCategories();
        });
    }

    function populateCategorySelects() {
        // Popula o select de categoria do formulário
        populateTransactionCategories();
        
        // Popula o select de categoria do filtro
        const filterCategorySelect = document.getElementById('filter-category');
        filterCategorySelect.innerHTML = '<option value="all">Todas Categorias</option>';
        
        // Adiciona categorias de receita
        categories.income.forEach(function(category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
        
        // Adiciona categorias de despesa
        categories.expense.forEach(function(category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategorySelect.appendChild(option);
        });
        
        // Popula o select de mês do filtro
        populateMonthFilter();
    }

    function populateTransactionCategories() {
        transactionCategory.innerHTML = '<option value="">Selecione...</option>';
        
        const type = transactionType.value;
        if (!type) return;
        
        const typeCategories = categories[type];
        typeCategories.forEach(function(category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            transactionCategory.appendChild(option);
        });
    }

    function populateMonthFilter() {
        const filterMonthSelect = document.getElementById('filter-month');
        filterMonthSelect.innerHTML = '<option value="all">Todos os Meses</option>';
        
        // Obtém todos os meses únicos das transações
        const transactions = getTransactions();
        const months = new Set();
        
        transactions.forEach(function(transaction) {
            const date = new Date(transaction.date);
            const monthYear = (date.getMonth() + 1) + '/' + date.getFullYear();
            months.add(monthYear);
        });
        
        // Ordena os meses do mais recente para o mais antigo
        const sortedMonths = Array.from(months).sort(function(a, b) {
            const partsA = a.split('/').map(Number);
            const partsB = b.split('/').map(Number);
            
            if (partsA[1] !== partsB[1]) return partsB[1] - partsA[1];
            return partsB[0] - partsA[0];
        });
        
        // Adiciona os meses ao select
        sortedMonths.forEach(function(monthYear) {
            const parts = monthYear.split('/');
            const monthName = new Date(parts[1], parts[0] - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            const option = document.createElement('option');
            option.value = monthYear;
            option.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            filterMonthSelect.appendChild(option);
        });
    }

    function addTransaction(e) {
        e.preventDefault();
        
        const type = transactionType.value;
        const category = transactionCategory.value;
        const amount = parseFloat(transactionAmount.value);
        const description = transactionDescription.value;
        const date = transactionDate.value;
        
        if (!type || !category || isNaN(amount)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            type: type,
            category: category,
            amount: amount,
            description: description,
            date: date
        };
        
        // Salva a transação
        saveTransaction(transaction);
        
        // Limpa o formulário
        transactionForm.reset();
        transactionDate.valueAsDate = new Date();
        
        // Atualiza a UI
        updateUI();
    }

    function saveTransaction(transaction) {
        const transactions = getTransactions();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function getTransactions() {
        const transactions = localStorage.getItem('transactions');
        return transactions ? JSON.parse(transactions) : [];
    }

    function loadTransactions() {
        const transactions = getTransactions();
        return transactions;
    }

    function deleteTransaction(id) {
        let transactions = getTransactions();
        transactions = transactions.filter(function(transaction) {
            return transaction.id !== id;
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateUI();
    }

    function setGoal() {
        const amount = parseFloat(goalAmount.value);
        
        if (isNaN(amount)) {
            alert('Por favor, insira um valor válido para a meta.');
            return;
        }
        
        localStorage.setItem('monthlyGoal', amount.toString());
        goalAmount.value = '';
        updateGoalProgress();
    }

    function loadGoal() {
        const goal = localStorage.getItem('monthlyGoal');
        return goal ? parseFloat(goal) : null;
    }

    function updateUI() {
        // Atualiza o saldo e totais
        updateBalance();
        
        // Atualiza a lista de transações
        updateTransactionsList();
        
        // Atualiza os gráficos
        updateCharts();
        
        // Atualiza o progresso da meta
        updateGoalProgress();
        
        // Atualiza o filtro de meses
        populateMonthFilter();
    }

    function updateBalance() {
        const transactions = getFilteredTransactions();
        
        let income = 0;
        let expenses = 0;
        
        transactions.forEach(function(transaction) {
            if (transaction.type === 'income') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });
        
        const balance = income - expenses;
        
        currentBalance.textContent = balance.toFixed(2);
        incomeValue.textContent = 'R$ ' + income.toFixed(2);
        expenseValue.textContent = 'R$ ' + expenses.toFixed(2);
        
        // Atualiza a cor do saldo baseado no valor
        currentBalance.parentElement.style.color = balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
    }

    function getFilteredTransactions() {
        const typeFilter = filterType.value;
        const categoryFilter = filterCategory.value;
        const monthFilter = filterMonth.value;
        
        let transactions = getTransactions();
        
        // Aplica filtros
        if (typeFilter !== 'all') {
            transactions = transactions.filter(function(t) {
                return t.type === typeFilter;
            });
        }
        
        if (categoryFilter !== 'all') {
            transactions = transactions.filter(function(t) {
                return t.category === categoryFilter;
            });
        }
        
        if (monthFilter !== 'all') {
            const parts = monthFilter.split('/').map(Number);
            
            transactions = transactions.filter(function(t) {
                const date = new Date(t.date);
                return date.getMonth() + 1 === parts[0] && date.getFullYear() === parts[1];
            });
        }
        
        return transactions;
    }

    function updateTransactionsList() {
        const transactions = getFilteredTransactions();
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-message">Nenhuma transação encontrada com os filtros atuais.</p>';
            return;
        }
        
        // Ordena transações por data (mais recente primeiro)
        transactions.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        transactionsList.innerHTML = '';
        
        transactions.forEach(function(transaction) {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-category">
                        <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                        ${transaction.category}
                    </div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button onclick="deleteTransaction(${transaction.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
    }

    function updateCharts() {
        const transactions = getTransactions();
        
        // Filtra transações do mês atual
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyTransactions = transactions.filter(function(t) {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        // Dados para o gráfico de despesas por categoria
        const expenses = monthlyTransactions.filter(function(t) {
            return t.type === 'expense';
        });
        const expenseCategories = {};
        
        expenses.forEach(function(expense) {
            if (!expenseCategories[expense.category]) {
                expenseCategories[expense.category] = 0;
            }
            expenseCategories[expense.category] += expense.amount;
        });
        
        // Dados para o gráfico de receitas vs despesas
        const totalIncome = monthlyTransactions
            .filter(function(t) {
                return t.type === 'income';
            })
            .reduce(function(sum, t) {
                return sum + t.amount;
            }, 0);
            
        const totalExpenses = monthlyTransactions
            .filter(function(t) {
                return t.type === 'expense';
            })
            .reduce(function(sum, t) {
                return sum + t.amount;
            }, 0);
        
        // Atualiza ou cria o gráfico de despesas por categoria
        const expensesCtx = document.getElementById('expenses-chart').getContext('2d');
        
        if (expensesChart) {
            expensesChart.destroy();
        }
        
        expensesChart = new Chart(expensesCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(expenseCategories),
                datasets: [{
                    data: Object.values(expenseCategories),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#8AC24A', '#607D8B', '#E91E63', '#00BCD4'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Atualiza ou cria o gráfico de receitas vs despesas
        const balanceCtx = document.getElementById('balance-chart').getContext('2d');
        
        if (balanceChart) {
            balanceChart.destroy();
        }
        
        if (totalIncome > 0 || totalExpenses > 0) {
            balanceChart = new Chart(balanceCtx, {
                type: 'bar',
                data: {
                    labels: ['Receitas', 'Despesas'],
                    datasets: [{
                        data: [totalIncome, totalExpenses],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    function updateGoalProgress() {
        const goal = loadGoal();
        if (!goal) {
            goalProgress.style.width = '0%';
            goalText.textContent = '0%';
            return;
        }
        
        const transactions = getTransactions();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyIncome = transactions
            .filter(function(t) {
                const date = new Date(t.date);
                return t.type === 'income' && 
                       date.getMonth() === currentMonth && 
                       date.getFullYear() === currentYear;
            })
            .reduce(function(sum, t) {
                return sum + t.amount;
            }, 0);
        
        const progress = Math.min((monthlyIncome / goal) * 100, 100);
        
        goalProgress.style.width = progress + '%';
        goalText.textContent = progress.toFixed(1) + '%';
        
        // Muda a cor baseada no progresso
        if (progress >= 100) {
            goalProgress.style.backgroundColor = 'var(--success-color)';
        } else if (progress >= 75) {
            goalProgress.style.backgroundColor = 'var(--warning-color)';
        } else {
            goalProgress.style.backgroundColor = 'var(--primary-color)';
        }
    }

    function updateMonthDisplay() {
        const currentDate = new Date();
        const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        monthDisplay.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    }

    // Torna a função acessível globalmente para os botões de deletar
    function setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteTransaction(id);
            });
        });
    }
})