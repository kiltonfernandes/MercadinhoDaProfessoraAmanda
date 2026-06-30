import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Archive,
  BadgeDollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  History,
  LayoutDashboard,
  Menu,
  Minus,
  PackagePlus,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Store,
  Trash2,
  Upload,
  UserRoundPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { dateTime, money, uid } from './data'
import { useStore } from './hooks'
import type { Customer, Product, SaleItem, StoreData, Transaction } from './types'

type Page = 'inicio' | 'produtos' | 'clientes' | 'caixa' | 'historico'
type ProductDraft = Omit<Product, 'id'>
type CustomerDraft = Omit<Customer, 'id' | 'balance'>

const productEmojis = ['🍎', '🍌', '🍓', '🥕', '🥛', '🧃', '🥖', '🧀', '🍪', '🍫', '🧸', '✏️']
const customerEmojis = ['🧒🏻', '🧒🏽', '👦🏻', '👧🏽', '👦🏿', '👧🏻', '🧑🏽', '👩🏻']
const CHECKOUT_CUSTOMER_PAGE_SIZE = 8
const CHECKOUT_PRODUCT_PAGE_SIZE = 12

const searchable = (value: string | number) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR')
  .trim()

const matchesSearch = (query: string, ...values: Array<string | number>) => {
  const terms = searchable(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const content = searchable(values.join(' '))
  return terms.every((term) => content.includes(term))
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return createPortal(
    <div className="mercadinho-dialog-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="mercadinho-dialog-panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="mercadinho-dialog-head">
          <div><span className="eyebrow">Mercadinho</span><h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={22} /></button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  )
}

function EmptyState({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return <div className="empty-state"><span>{emoji}</span><h3>{title}</h3><p>{text}</p></div>
}

function App() {
  const { data, setData } = useStore()
  const [page, setPage] = useState<Page>('inicio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [productModal, setProductModal] = useState(false)
  const [customerModal, setCustomerModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [toast, setToast] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const saveProduct = (draft: ProductDraft) => {
    setData((current) => ({
      ...current,
      products: editingProduct
        ? current.products.map((item) => item.id === editingProduct.id ? { ...draft, id: item.id } : item)
        : [...current.products, { ...draft, id: uid() }],
    }))
    setProductModal(false)
    setEditingProduct(null)
    notify(editingProduct ? 'Produto atualizado!' : 'Produto chegou à prateleira!')
  }

  const saveCustomer = (draft: CustomerDraft) => {
    setData((current) => ({
      ...current,
      customers: editingCustomer
        ? current.customers.map((item) => item.id === editingCustomer.id ? { ...item, ...draft } : item)
        : [...current.customers, { ...draft, balance: 0, id: uid() }],
    }))
    setCustomerModal(false)
    setEditingCustomer(null)
    notify(editingCustomer ? 'Cliente atualizado!' : 'Novo cliente cadastrado!')
  }

  const deleteProduct = (id: string) => {
    if (!confirm('Retirar este produto do mercadinho? O histórico de vendas será preservado.')) return
    setData((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) }))
    notify('Produto retirado.')
  }

  const deleteCustomer = (id: string) => {
    const customer = data.customers.find((item) => item.id === id)
    if (customer?.balance) return notify('Quite o saldo antes de excluir este cliente.')
    if (!confirm('Excluir este cliente? O histórico será preservado.')) return
    setData((current) => ({ ...current, customers: current.customers.filter((item) => item.id !== id) }))
    notify('Cliente removido.')
  }

  const updateBehavior = (id: string, field: 'goodBehavior' | 'badBehavior', delta: number) => {
    setData((current) => ({
      ...current,
      customers: current.customers.map((item) =>
        item.id === id ? { ...item, [field]: Math.max(0, item[field] + delta) } : item),
    }))
  }

  const payBalance = (customer: Customer) => {
    const input = prompt(`Saldo de ${customer.name}: ${money.format(customer.balance)}\nQual valor será pago?`, String(customer.balance))
    if (input === null) return
    const value = Number(input.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0 || value > customer.balance) return notify('Digite um valor válido, até o saldo atual.')
    const transaction: Transaction = { id: uid(), type: 'payment', customerId: customer.id, customerName: customer.name, date: new Date().toISOString(), total: value }
    setData((current) => ({
      ...current,
      customers: current.customers.map((item) => item.id === customer.id ? { ...item, balance: item.balance - value } : item),
      transactions: [transaction, ...current.transactions],
    }))
    notify('Pagamento registrado. Cofrinho atualizado!')
  }

  const finishSale = (customerId: string, items: SaleItem[], total: number) => {
    const customer = data.customers.find((item) => item.id === customerId)
    if (!customer) return
    const transaction: Transaction = { id: uid(), type: 'sale', customerId, customerName: customer.name, date: new Date().toISOString(), total, items }
    setData((current) => ({
      products: current.products.map((product) => {
        const sold = items.find((item) => item.productId === product.id)
        return sold ? { ...product, stock: product.stock - sold.quantity } : product
      }),
      customers: current.customers.map((item) => item.id === customerId ? { ...item, balance: item.balance + total } : item),
      transactions: [transaction, ...current.transactions],
    }))
    notify('Venda concluída! ✨')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `backup-mercadinho-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    notify('Backup guardado!')
  }

  const importData = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as StoreData
      if (!Array.isArray(parsed.products) || !Array.isArray(parsed.customers) || !Array.isArray(parsed.transactions)) throw new Error()
      if (!confirm('Substituir os dados atuais pelos dados deste backup?')) return
      setData(parsed)
      notify('Backup restaurado!')
    } catch {
      notify('Este arquivo não é um backup válido.')
    }
  }

  const navigate = (next: Page) => { setPage(next); setMenuOpen(false) }
  const pageNames: Record<Page, string> = { inicio: 'Visão geral', produtos: 'Produtos', clientes: 'Clientes', caixa: 'Caixa', historico: 'Histórico' }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X /></button>
        <div className="brand"><div className="brand-icon"><Store /></div><div><strong>Mercadinho</strong><span>da Profª Amanda</span></div></div>
        <div className="hello-card"><span className="sun">☀️</span><div><strong>Olá, professora!</strong><p>Vamos aprender brincando?</p></div></div>
        <nav>
          <button className={page === 'inicio' ? 'active' : ''} onClick={() => navigate('inicio')}><LayoutDashboard /> Visão geral</button>
          <button className={page === 'produtos' ? 'active' : ''} onClick={() => navigate('produtos')}><ShoppingBasket /> Produtos</button>
          <button className={page === 'clientes' ? 'active' : ''} onClick={() => navigate('clientes')}><Users /> Clientes</button>
          <button className={page === 'caixa' ? 'active' : ''} onClick={() => navigate('caixa')}><CircleDollarSign /> Abrir o caixa</button>
          <button className={page === 'historico' ? 'active' : ''} onClick={() => navigate('historico')}><History /> Histórico</button>
        </nav>
        <div className="backup-box">
          <strong>Cuide dos seus dados</strong><span>Salve uma cópia de vez em quando.</span>
          <div><button onClick={exportData} title="Exportar backup"><Download size={17} /> Salvar</button><button onClick={() => importRef.current?.click()} title="Importar backup"><Upload size={17} /></button></div>
          <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={(e) => importData(e.target.files?.[0])} />
        </div>
        <div className="sidebar-footer"><Sparkles size={16} /> Feito para aprender</div>
      </aside>
      {menuOpen && <div className="menu-scrim" role="presentation" onClick={() => setMenuOpen(false)} />}

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <div><span className="breadcrumb">Meu mercadinho <ChevronRight size={14} /></span><h1>{pageNames[page]}</h1></div>
          <div className="top-actions">
            <div className="mini-badge"><span>🪙</span><div><small>Total a receber</small><strong>{money.format(data.customers.reduce((sum, c) => sum + c.balance, 0))}</strong></div></div>
            <button className="primary small" onClick={() => navigate('caixa')}><ShoppingBasket size={18} /> Nova venda</button>
          </div>
        </header>

        <div className="content">
          {page === 'inicio' && <Dashboard data={data} navigate={navigate} />}
          {page === 'produtos' && <Products products={data.products} onAdd={() => { setEditingProduct(null); setProductModal(true) }} onEdit={(item) => { setEditingProduct(item); setProductModal(true) }} onDelete={deleteProduct} />}
          {page === 'clientes' && <Customers customers={data.customers} onAdd={() => { setEditingCustomer(null); setCustomerModal(true) }} onEdit={(item) => { setEditingCustomer(item); setCustomerModal(true) }} onDelete={deleteCustomer} onBehavior={updateBehavior} onPay={payBalance} />}
          {page === 'caixa' && <Checkout products={data.products} customers={data.customers} onFinish={finishSale} />}
          {page === 'historico' && <Transactions transactions={data.transactions} />}
        </div>
      </main>

      {productModal && <ProductForm product={editingProduct} onClose={() => { setProductModal(false); setEditingProduct(null) }} onSave={saveProduct} />}
      {customerModal && <CustomerForm customer={editingCustomer} onClose={() => { setCustomerModal(false); setEditingCustomer(null) }} onSave={saveCustomer} />}
      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </div>
  )
}

function Dashboard({ data, navigate }: { data: StoreData; navigate: (page: Page) => void }) {
  const sales = data.transactions.filter((t) => t.type === 'sale')
  const revenue = sales.reduce((sum, item) => sum + item.total, 0)
  const lowStock = data.products.filter((item) => item.stock <= 3)
  const debt = data.customers.reduce((sum, item) => sum + item.balance, 0)
  return (
    <>
      <section className="hero">
        <div><span className="pill"><Sparkles size={15} /> Aprender fazendo</span><h2>O mercadinho está aberto!</h2><p>Organize as prateleiras, acompanhe a turminha e transforme cada compra em uma descoberta.</p><button className="primary" onClick={() => navigate('caixa')}><ShoppingBasket /> Começar uma venda</button></div>
        <div className="hero-art" aria-hidden="true"><span className="cloud one">☁️</span><span className="cloud two">☁️</span><div className="awning">◠ ◠ ◠ ◠</div><div className="little-store"><span>🍎</span><strong>ABERTO</strong><span>🧃</span></div><div className="bush">🌿</div></div>
      </section>
      <section className="stats">
        <article className="stat"><div className="stat-icon peach"><BadgeDollarSign /></div><div><span>Vendido no total</span><strong>{money.format(revenue)}</strong><small>{sales.length} {sales.length === 1 ? 'venda' : 'vendas'} registrada(s)</small></div></article>
        <article className="stat"><div className="stat-icon green"><WalletCards /></div><div><span>A receber</span><strong>{money.format(debt)}</strong><small>Crédito usado pela turminha</small></div></article>
        <article className="stat"><div className="stat-icon yellow"><Archive /></div><div><span>Na prateleira</span><strong>{data.products.reduce((sum, p) => sum + p.stock, 0)} itens</strong><small>{data.products.length} tipos de produto</small></div></article>
        <article className="stat"><div className="stat-icon blue"><Users /></div><div><span>Clientes</span><strong>{data.customers.length}</strong><small>Crianças cadastradas</small></div></article>
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">Atenção</span><h3>Estoque baixinho</h3></div><button className="text-button" onClick={() => navigate('produtos')}>Ver produtos <ChevronRight size={16} /></button></div>
          {lowStock.length ? <div className="mini-list">{lowStock.slice(0, 5).map((item) => <div key={item.id}><span className="emoji-box">{item.emoji}</span><div><strong>{item.name}</strong><small>{item.stock === 0 ? 'Acabou!' : `Restam ${item.stock}`}</small></div><span className={`stock-tag ${item.stock === 0 ? 'danger' : ''}`}>{item.stock}</span></div>)}</div> : <EmptyState emoji="🌱" title="Tudo abastecido!" text="Nenhum produto com estoque baixo." />}
        </article>
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">Movimento</span><h3>Últimas atividades</h3></div><button className="text-button" onClick={() => navigate('historico')}>Ver tudo <ChevronRight size={16} /></button></div>
          {data.transactions.length ? <div className="mini-list activity">{data.transactions.slice(0, 5).map((item) => <div key={item.id}><span className="emoji-box">{item.type === 'sale' ? '🛍️' : '🪙'}</span><div><strong>{item.type === 'sale' ? `Venda para ${item.customerName}` : `Pagamento de ${item.customerName}`}</strong><small>{dateTime.format(new Date(item.date))}</small></div><b className={item.type === 'payment' ? 'positive' : ''}>{item.type === 'payment' ? '−' : '+'}{money.format(item.total)}</b></div>)}</div> : <EmptyState emoji="🧾" title="Tudo quietinho por aqui" text="As vendas e pagamentos vão aparecer aqui." />}
        </article>
      </section>
    </>
  )
}

function Products({ products, onAdd, onEdit, onDelete }: { products: Product[]; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const filtered = products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <section className="page-section">
      <div className="section-intro"><div><span className="eyebrow">Prateleiras</span><h2>Produtos do mercadinho</h2><p>Cadastre os itens, preços e quantidades disponíveis.</p></div><button className="primary" onClick={onAdd}><PackagePlus /> Novo produto</button></div>
      <div className="toolbar"><label className="search"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..." /></label><span>{filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}</span></div>
      {filtered.length ? <div className="product-grid">{filtered.map((item) => <article className="product-card" key={item.id}><div className="product-emoji">{item.emoji}</div><div className="product-body"><span className={`stock-pill ${item.stock === 0 ? 'out' : item.stock <= 3 ? 'low' : ''}`}>{item.stock === 0 ? 'Sem estoque' : `${item.stock} em estoque`}</span><h3>{item.name}</h3><strong>{money.format(item.price)}</strong><small>por unidade</small></div><div className="card-actions"><button onClick={() => onEdit(item)}>Editar</button><button className="danger-button" onClick={() => onDelete(item.id)} aria-label={`Excluir ${item.name}`}><Trash2 size={17} /></button></div></article>)}</div> : <EmptyState emoji="🧺" title="Nenhum produto encontrado" text="Tente outra busca ou adicione um produto." />}
    </section>
  )
}

function Customers({ customers, onAdd, onEdit, onDelete, onBehavior, onPay }: { customers: Customer[]; onAdd: () => void; onEdit: (c: Customer) => void; onDelete: (id: string) => void; onBehavior: (id: string, field: 'goodBehavior' | 'badBehavior', delta: number) => void; onPay: (c: Customer) => void }) {
  const [search, setSearch] = useState('')
  const filtered = customers.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <section className="page-section">
      <div className="section-intro"><div><span className="eyebrow">Turminha</span><h2>Clientes e crédito</h2><p>Acompanhe o crédito, o saldo e as atitudes de cada criança.</p></div><button className="primary" onClick={onAdd}><UserRoundPlus /> Novo cliente</button></div>
      <div className="toolbar"><label className="search"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." /></label><span>{filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}</span></div>
      {filtered.length ? <div className="customer-grid">{filtered.map((item) => {
        const available = Math.max(0, item.creditLimit - item.balance)
        const percent = item.creditLimit ? Math.min(100, (item.balance / item.creditLimit) * 100) : 0
        return <article className="customer-card" key={item.id}>
          <div className="customer-top"><div className="avatar">{item.emoji}</div><div><h3>{item.name}</h3><span>{item.age} anos</span></div><button className="dots" onClick={() => onEdit(item)}>Editar</button></div>
          <div className="credit-box"><div><span>Saldo usado</span><strong>{money.format(item.balance)}</strong></div><div><span>Disponível</span><b>{money.format(available)}</b></div><div className="progress"><i style={{ width: `${percent}%` }} /></div><small>Limite de {money.format(item.creditLimit)}</small></div>
          <div className="behavior-row"><div><span>⭐ Boas atitudes</span><div><button onClick={() => onBehavior(item.id, 'goodBehavior', -1)}><Minus /></button><strong>{item.goodBehavior}</strong><button onClick={() => onBehavior(item.id, 'goodBehavior', 1)}><Plus /></button></div></div><div><span>🌧️ A melhorar</span><div><button onClick={() => onBehavior(item.id, 'badBehavior', -1)}><Minus /></button><strong>{item.badBehavior}</strong><button onClick={() => onBehavior(item.id, 'badBehavior', 1)}><Plus /></button></div></div></div>
          <div className="card-actions"><button disabled={item.balance <= 0} onClick={() => onPay(item)}><CircleDollarSign size={17} /> Registrar pagamento</button><button className="danger-button" onClick={() => onDelete(item.id)} aria-label={`Excluir ${item.name}`}><Trash2 size={17} /></button></div>
        </article>
      })}</div> : <EmptyState emoji="👋" title="Nenhum cliente encontrado" text="Cadastre uma criança para começar." />}
    </section>
  )
}

function Pagination({ page, totalPages, totalItems, label, onChange }: { page: number; totalPages: number; totalItems: number; label: string; onChange: (page: number) => void }) {
  if (totalPages <= 1) return <span className="result-count">{totalItems} {label}</span>
  return (
    <div className="pagination" aria-label={`Paginação de ${label}`}>
      <span>{totalItems} {label} · Página {page} de {totalPages}</span>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Página anterior"><ChevronLeft /></button>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Próxima página"><ChevronRight /></button>
    </div>
  )
}

function Checkout({ products, customers, onFinish }: { products: Product[]; customers: Customer[]; onFinish: (id: string, items: SaleItem[], total: number) => void }) {
  const [customerId, setCustomerId] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [customerPage, setCustomerPage] = useState(1)
  const [productPage, setProductPage] = useState(1)
  const availableProducts = useMemo(() => products.filter((item) => item.stock > 0), [products])
  const filteredCustomers = useMemo(
    () => customers.filter((item) => matchesSearch(customerSearch, item.name, item.age, item.emoji)),
    [customerSearch, customers],
  )
  const filteredProducts = useMemo(
    () => availableProducts.filter((item) => matchesSearch(productSearch, item.name, item.emoji, item.price)),
    [availableProducts, productSearch],
  )
  const customerTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / CHECKOUT_CUSTOMER_PAGE_SIZE))
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / CHECKOUT_PRODUCT_PAGE_SIZE))
  const currentCustomerPage = Math.min(customerPage, customerTotalPages)
  const currentProductPage = Math.min(productPage, productTotalPages)
  const visibleCustomers = filteredCustomers.slice((currentCustomerPage - 1) * CHECKOUT_CUSTOMER_PAGE_SIZE, currentCustomerPage * CHECKOUT_CUSTOMER_PAGE_SIZE)
  const visibleProducts = filteredProducts.slice((currentProductPage - 1) * CHECKOUT_PRODUCT_PAGE_SIZE, currentProductPage * CHECKOUT_PRODUCT_PAGE_SIZE)
  const customer = customers.find((item) => item.id === customerId)
  const items = useMemo(() => products.filter((p) => cart[p.id]).map((p) => ({ productId: p.id, name: p.name, emoji: p.emoji, quantity: cart[p.id], unitPrice: p.price })), [cart, products])
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const creditAvailable = customer ? customer.creditLimit - customer.balance : 0
  const canFinish = !!customer && items.length > 0 && total <= creditAvailable
  const change = (product: Product, delta: number) => setCart((current) => ({ ...current, [product.id]: Math.max(0, Math.min(product.stock, (current[product.id] || 0) + delta)) }))
  const finish = () => { if (!canFinish) return; onFinish(customerId, items, total); setCart({}); setCustomerId('') }
  return (
    <section className="page-section checkout-page">
      <div className="section-intro"><div><span className="eyebrow">Caixa aberto</span><h2>Monte a comprinha</h2><p>Escolha o cliente e coloque os produtos na cesta.</p></div></div>
      {!customers.length || !products.length ? <EmptyState emoji="🏪" title="Vamos preparar o mercadinho?" text="Cadastre ao menos um cliente e um produto antes de vender." /> :
      <div className="checkout-grid">
        <div className="shop-panel">
          <div className="step-title"><span>1</span><div><h3>Quem está comprando?</h3><p>Escolha um cliente da turminha.</p></div></div>
          <div className="checkout-browser">
            <label className="checkout-search"><Search /><input value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setCustomerPage(1) }} placeholder="Buscar por nome, idade ou avatar..." aria-label="Buscar clientes no caixa" /></label>
            <Pagination page={currentCustomerPage} totalPages={customerTotalPages} totalItems={filteredCustomers.length} label={filteredCustomers.length === 1 ? 'cliente' : 'clientes'} onChange={setCustomerPage} />
          </div>
          {visibleCustomers.length ? <div className="customer-picker">{visibleCustomers.map((item) => <button key={item.id} className={customerId === item.id ? 'selected' : ''} onClick={() => setCustomerId(item.id)}><span>{item.emoji}</span><strong>{item.name}</strong><small>{money.format(Math.max(0, item.creditLimit - item.balance))} livres</small>{customerId === item.id && <i><Check /></i>}</button>)}</div> : <div className="checkout-no-results"><span>🔎</span><p>Nenhum cliente encontrado.</p></div>}
          <div className="step-title products-step"><span>2</span><div><h3>O que vai na cesta?</h3><p>Use os botões para escolher as quantidades.</p></div></div>
          <div className="checkout-browser">
            <label className="checkout-search"><Search /><input value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setProductPage(1) }} placeholder="Buscar produto, emoji ou preço..." aria-label="Buscar produtos no caixa" /></label>
            <Pagination page={currentProductPage} totalPages={productTotalPages} totalItems={filteredProducts.length} label={filteredProducts.length === 1 ? 'produto' : 'produtos'} onChange={setProductPage} />
          </div>
          {visibleProducts.length ? <div className="checkout-products">{visibleProducts.map((item) => <article key={item.id}><span className="checkout-emoji">{item.emoji}</span><div><h4>{item.name}</h4><strong>{money.format(item.price)}</strong><small>{item.stock} disponíveis</small></div><div className="quantity"><button onClick={() => change(item, -1)} disabled={!cart[item.id]}><Minus /></button><b>{cart[item.id] || 0}</b><button onClick={() => change(item, 1)} disabled={(cart[item.id] || 0) >= item.stock}><Plus /></button></div></article>)}</div> : availableProducts.length ? <div className="checkout-no-results"><span>🔎</span><p>Nenhum produto encontrado.</p></div> : <EmptyState emoji="📦" title="As prateleiras estão vazias" text="Reponha o estoque para fazer uma venda." />}
        </div>
        <aside className="receipt">
          <div className="receipt-top"><span>🧺</span><div><small>Resumo da</small><h3>Comprinha</h3></div></div>
          <div className="receipt-customer">{customer ? <><span>{customer.emoji}</span><div><small>Cliente</small><strong>{customer.name}</strong></div></> : <p>Escolha um cliente para começar.</p>}</div>
          <div className="receipt-items">{items.length ? items.map((item) => <div key={item.productId}><span>{item.emoji} {item.name} <small>× {item.quantity}</small></span><strong>{money.format(item.quantity * item.unitPrice)}</strong></div>) : <div className="empty-cart"><span>🛒</span><p>A cesta ainda está vazia.</p></div>}</div>
          <div className="receipt-total"><span>Total</span><strong>{money.format(total)}</strong></div>
          {customer && total > creditAvailable && <div className="credit-warning">O total ultrapassa o crédito disponível em {money.format(total - creditAvailable)}.</div>}
          <button className="primary finish" disabled={!canFinish} onClick={finish}><Check /> Concluir venda</button>
          <small className="receipt-note">A compra será adicionada ao saldo do cliente.</small>
        </aside>
      </div>}
    </section>
  )
}

function Transactions({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<'all' | 'sale' | 'payment'>('all')
  const list = transactions.filter((item) => filter === 'all' || item.type === filter)
  return (
    <section className="page-section">
      <div className="section-intro"><div><span className="eyebrow">Caderneta</span><h2>Histórico do mercadinho</h2><p>Todas as compras e pagamentos ficam guardados aqui.</p></div></div>
      <div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tudo</button><button className={filter === 'sale' ? 'active' : ''} onClick={() => setFilter('sale')}>Vendas</button><button className={filter === 'payment' ? 'active' : ''} onClick={() => setFilter('payment')}>Pagamentos</button></div>
      {list.length ? <div className="transaction-list">{list.map((item) => <article key={item.id}><span className={`transaction-icon ${item.type}`}>{item.type === 'sale' ? '🛍️' : '🪙'}</span><div className="transaction-main"><span className="transaction-type">{item.type === 'sale' ? 'Venda' : 'Pagamento'}</span><h3>{item.customerName}</h3><small>{dateTime.format(new Date(item.date))}</small>{item.items && <p>{item.items.map((part) => `${part.quantity}× ${part.name}`).join(' · ')}</p>}</div><strong className={item.type === 'payment' ? 'positive' : ''}>{item.type === 'payment' ? '−' : '+'}{money.format(item.total)}</strong></article>)}</div> : <EmptyState emoji="🧾" title="Nada registrado ainda" text="As atividades do caixa aparecerão aqui." />}
    </section>
  )
}

function ProductForm({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: (p: ProductDraft) => void }) {
  const [form, setForm] = useState<ProductDraft>(product ? { name: product.name, emoji: product.emoji, price: product.price, stock: product.stock } : { name: '', emoji: '🍎', price: 0, stock: 0 })
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (form.name.trim() && form.price >= 0 && form.stock >= 0) onSave({ ...form, name: form.name.trim() }) }
  return <Modal title={product ? 'Editar produto' : 'Novo produto'} onClose={onClose}><form className="form" onSubmit={submit}><label>Nome do produto<input autoFocus required maxLength={40} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Suco de uva" /></label><fieldset><legend>Escolha um emoji</legend><div className="emoji-picker">{productEmojis.map((emoji) => <button type="button" className={form.emoji === emoji ? 'selected' : ''} key={emoji} onClick={() => setForm({ ...form, emoji })}>{emoji}</button>)}</div></fieldset><div className="form-row"><label>Preço em reais<div className="input-prefix"><span>R$</span><input required min="0" step="0.01" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div></label><label>Estoque<input required min="0" step="1" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></label></div><div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit"><Check /> Salvar produto</button></div></form></Modal>
}

function CustomerForm({ customer, onClose, onSave }: { customer: Customer | null; onClose: () => void; onSave: (c: CustomerDraft) => void }) {
  const [form, setForm] = useState<CustomerDraft>(customer ? { name: customer.name, age: customer.age, emoji: customer.emoji, goodBehavior: customer.goodBehavior, badBehavior: customer.badBehavior, creditLimit: customer.creditLimit } : { name: '', age: 7, emoji: '🧒🏽', goodBehavior: 0, badBehavior: 0, creditLimit: 20 })
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (form.name.trim() && form.age > 0 && form.creditLimit >= 0) onSave({ ...form, name: form.name.trim() }) }
  return <Modal title={customer ? 'Editar cliente' : 'Novo cliente'} onClose={onClose}><form className="form" onSubmit={submit}><label>Nome da criança<input autoFocus required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Marina" /></label><fieldset><legend>Escolha um avatar</legend><div className="emoji-picker">{customerEmojis.map((emoji) => <button type="button" className={form.emoji === emoji ? 'selected' : ''} key={emoji} onClick={() => setForm({ ...form, emoji })}>{emoji}</button>)}</div></fieldset><div className="form-row"><label>Idade<input required min="1" max="99" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></label><label>Limite de crédito<div className="input-prefix"><span>R$</span><input required min="0" step="0.01" type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} /></div></label></div><div className="form-row"><label>⭐ Boas atitudes<input required min="0" step="1" type="number" value={form.goodBehavior} onChange={(e) => setForm({ ...form, goodBehavior: Number(e.target.value) })} /></label><label>🌧️ A melhorar<input required min="0" step="1" type="number" value={form.badBehavior} onChange={(e) => setForm({ ...form, badBehavior: Number(e.target.value) })} /></label></div><div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit"><Check /> Salvar cliente</button></div></form></Modal>
}

export default App
