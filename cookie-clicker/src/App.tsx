import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// أنواع البيانات
interface Upgrade {
  id: number;
  name: string;
  description: string;
  cost: number;
  cps: number; // كوكيز في الثانية
  count: number;
  emoji: string;
}

function App() {
  // حالة اللعبة
  const [cookies, setCookies] = useState<number>(() => {
    const saved = localStorage.getItem('cookies');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [totalCookies, setTotalCookies] = useState<number>(() => {
    const saved = localStorage.getItem('totalCookies');
    return saved ? parseFloat(saved) : 0;
  });

  const [clickPower, setClickPower] = useState<number>(() => {
    const saved = localStorage.getItem('clickPower');
    return saved ? parseFloat(saved) : 1;
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('upgrades');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'جدة طباخة', description: 'تخبز 1 كوكيز/ثانية', cost: 15, cps: 1, count: 0, emoji: '👵' },
      { id: 2, name: 'مزرعة', description: 'تنتج 5 كوكيز/ثانية', cost: 100, cps: 5, count: 0, emoji: '🌾' },
      { id: 3, name: 'مصنع', description: 'ينتج 20 كوكيز/ثانية', cost: 500, cps: 20, count: 0, emoji: '🏭' },
      { id: 4, name: 'منجم', description: 'يستخرج 50 كوكيز/ثانية', cost: 2000, cps: 50, count: 0, emoji: '⛏️' },
      { id: 5, name: 'مختبر', description: 'يصنع 100 كوكيز/ثانية', cost: 7000, cps: 100, count: 0, emoji: '🔬' },
      { id: 6, name: 'بوابة سحرية', description: 'تجلب 500 كوكيز/ثانية', cost: 30000, cps: 500, count: 0, emoji: '🌀' },
      { id: 7, name: 'آلة الزمن', description: 'تجلب 2000 كوكيز/ثانية', cost: 100000, cps: 2000, count: 0, emoji: '⏰' },
      { id: 8, name: 'مولد كوني', description: 'ينتج 10000 كوكيز/ثانية', cost: 500000, cps: 10000, count: 0, emoji: '🌌' },
    ];
  });

  const [clickAnimation, setClickAnimation] = useState<boolean>(false);
  const [floatingNumbers, setFloatingNumbers] = useState<{id: number, x: number, y: number, value: number}[]>([]);

  // حساب الكوكيز في الثانية
  const cps = upgrades.reduce((total, upgrade) => total + (upgrade.cps * upgrade.count), 0);

  // حفظ البيانات
  useEffect(() => {
    localStorage.setItem('cookies', cookies.toString());
    localStorage.setItem('totalCookies', totalCookies.toString());
    localStorage.setItem('clickPower', clickPower.toString());
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
  }, [cookies, totalCookies, clickPower, upgrades]);

  // إنتاج الكوكيز تلقائياً
  useEffect(() => {
    const interval = setInterval(() => {
      if (cps > 0) {
        setCookies(prev => prev + cps / 10);
        setTotalCookies(prev => prev + cps / 10);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [cps]);

  // النقر على الكوكيز
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setCookies(prev => prev + clickPower);
    setTotalCookies(prev => prev + clickPower);
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 100);

    // إضافة رقم طائر
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = Date.now() + Math.random();
    
    setFloatingNumbers(prev => [...prev, { id, x, y, value: clickPower }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    }, 1000);
  }, [clickPower]);

  // شراء ترقية
  const buyUpgrade = (upgradeId: number) => {
    setUpgrades(prev => prev.map(upgrade => {
      if (upgrade.id === upgradeId && cookies >= upgrade.cost) {
        setCookies(c => c - upgrade.cost);
        const newCount = upgrade.count + 1;
        const newCost = Math.floor(upgrade.cost * 1.15);
        return { ...upgrade, count: newCount, cost: newCost };
      }
      return upgrade;
    }));
  };

  // ترقية قوة النقر
  const upgradeClickPower = () => {
    const cost = Math.floor(50 * Math.pow(1.5, clickPower - 1));
    if (cookies >= cost) {
      setCookies(prev => prev - cost);
      setClickPower(prev => prev + 1);
    }
  };

  // تنسيق الأرقام
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + ' تريليون';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + ' مليار';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + ' مليون';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + ' ألف';
    return Math.floor(num).toString();
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين اللعبة؟ ستفقد كل تقدمك!')) {
      localStorage.clear();
      setCookies(0);
      setTotalCookies(0);
      setClickPower(1);
      setUpgrades([
        { id: 1, name: 'جدة طباخة', description: 'تخبز 1 كوكيز/ثانية', cost: 15, cps: 1, count: 0, emoji: '👵' },
        { id: 2, name: 'مزرعة', description: 'تنتج 5 كوكيز/ثانية', cost: 100, cps: 5, count: 0, emoji: '🌾' },
        { id: 3, name: 'مصنع', description: 'ينتج 20 كوكيز/ثانية', cost: 500, cps: 20, count: 0, emoji: '🏭' },
        { id: 4, name: 'منجم', description: 'يستخرج 50 كوكيز/ثانية', cost: 2000, cps: 50, count: 0, emoji: '⛏️' },
        { id: 5, name: 'مختبر', description: 'يصنع 100 كوكيز/ثانية', cost: 7000, cps: 100, count: 0, emoji: '🔬' },
        { id: 6, name: 'بوابة سحرية', description: 'تجلب 500 كوكيز/ثانية', cost: 30000, cps: 500, count: 0, emoji: '🌀' },
        { id: 7, name: 'آلة الزمن', description: 'تجلب 2000 كوكيز/ثانية', cost: 100000, cps: 2000, count: 0, emoji: '⏰' },
        { id: 8, name: 'مولد كوني', description: 'ينتج 10000 كوكيز/ثانية', cost: 500000, cps: 10000, count: 0, emoji: '🌌' },
      ]);
    }
  };

  const clickUpgradeCost = Math.floor(50 * Math.pow(1.5, clickPower - 1));

  return (
    <div className="app" dir="rtl">
      {/* الهيدر */}
      <header className="header">
        <h1>🍪 لعبة الكوكيز 🍪</h1>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{formatNumber(cookies)}</span>
            <span className="stat-label">كوكيز</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatNumber(cps)}</span>
            <span className="stat-label">في الثانية</span>
          </div>
        </div>
      </header>

      {/* منطقة النقر */}
      <div className="cookie-area">
        <div 
          className={`cookie-container ${clickAnimation ? 'clicked' : ''}`}
          onClick={handleClick}
          onTouchStart={handleClick}
        >
          <div className="cookie">🍪</div>
          {floatingNumbers.map(num => (
            <div 
              key={num.id} 
              className="floating-number"
              style={{ left: num.x, top: num.y }}
            >
              +{num.value}
            </div>
          ))}
        </div>
        <p className="click-hint">اضغط على الكوكيز!</p>
      </div>

      {/* قسم الترقيات */}
      <div className="upgrades-section">
        <h2>🛒 المتجر</h2>
        
        {/* ترقية قوة النقر */}
        <div 
          className={`upgrade-card click-upgrade ${cookies >= clickUpgradeCost ? 'affordable' : 'locked'}`}
          onClick={() => upgradeClickPower()}
        >
          <div className="upgrade-emoji">👆</div>
          <div className="upgrade-info">
            <div className="upgrade-name">قوة النقر (المستوى {clickPower})</div>
            <div className="upgrade-desc">+1 كوكيز لكل نقرة</div>
          </div>
          <div className="upgrade-cost">
            <span>{formatNumber(clickUpgradeCost)}</span>
            <span className="cookie-icon">🍪</span>
          </div>
        </div>

        {/* قائمة الترقيات */}
        <div className="upgrades-list">
          {upgrades.map(upgrade => (
            <div 
              key={upgrade.id}
              className={`upgrade-card ${cookies >= upgrade.cost ? 'affordable' : 'locked'}`}
              onClick={() => buyUpgrade(upgrade.id)}
            >
              <div className="upgrade-emoji">{upgrade.emoji}</div>
              <div className="upgrade-info">
                <div className="upgrade-name">
                  {upgrade.name}
                  {upgrade.count > 0 && <span className="upgrade-count">×{upgrade.count}</span>}
                </div>
                <div className="upgrade-desc">{upgrade.description}</div>
              </div>
              <div className="upgrade-cost">
                <span>{formatNumber(upgrade.cost)}</span>
                <span className="cookie-icon">🍪</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الفوتر */}
      <footer className="footer">
        <div className="total-stats">
          <span>إجمالي الكوكيز: {formatNumber(totalCookies)}</span>
        </div>
        <button className="reset-btn" onClick={resetGame}>
          🔄 إعادة تعيين
        </button>
      </footer>
    </div>
  );
}

export default App;
