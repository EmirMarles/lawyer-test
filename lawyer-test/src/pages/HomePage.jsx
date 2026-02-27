import './HomePage.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const CATEGORIES = [
    { key: 'I.', label: 'Вопросы по Уголовно-процессуальному праву Кыргызской Республики' },
    { key: 'II.', label: 'Вопросы по Уголовно-исполнительному законодательству Кыргызской Республики' },
    { key: 'III.', label: 'Вопросы по Трудовому праву Кыргызской Республики' },
    { key: 'IV.', label: 'Вопросы по Семейному праву Кыргызской Республики' },
    { key: 'V.', label: 'Вопросы по Международному праву' },
    { key: 'VI.', label: 'Вопросы по Конституционному праву Кыргызской Республики' },
    { key: 'VII.', label: 'Вопросы по Уголовному праву Кыргызской Республики' },
    { key: 'VIII.', label: 'Вопросы по Исполнительному производству' },
    { key: 'IX.', label: 'Вопросы по Таможенному праву Кыргызской Республики' },
    { key: 'X.', label: 'Вопросы по Таможенному праву Кыргызской Республики' },
    { key: 'XI.', label: 'Вопросы по Гражданскому процессуальному праву Кыргызской Республики' },
    { key: 'XII.', label: 'Вопросы по Досудебным (внесудебным) способам урегулирования спора' },
    { key: 'XIII.', label: 'Вопросы по Гендерному праву' },
    { key: 'XIV.', label: 'Вопросы по Административно-процессуальному праву Кыргызской Республики' },
    { key: 'XV.', label: 'Вопросы по Гражданскому праву Кыргызской Республики' },
    { key: 'XVI.', label: 'Вопросы по Земельному праву Кыргызской Республики' },
    { key: 'XVII.', label: 'Вопросы по Природоресурсному праву' },
    { key: 'XVIII.', label: 'Вопросы по компьютерной грамотности' },
];

export function HomePage({ setTimerBool }) {

    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].key);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState(null);

    const handleStart = () => {
        navigate('/main-test-page')
        setTimerBool(true)
    }

    const handleFetchCategory = async () => {
        try {
            setLoadingCategory(true);
            setCategoryError(null);
            setCategoryInfo(null);
            const response = await axios.get(`${apiUrl}/api/questions/by-category`, {
                params: { categoryKey: selectedCategory }
            });
            setCategoryInfo({
                name: response.data.categoryName,
                count: response.data.count
            });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to load category questions';
            setCategoryError(msg);
        } finally {
            setLoadingCategory(false);
        }
    }

    return (
        <div className="home-page">
            <div className='home-layout'>
                <div className="test-header">Welcome to Lawyer Test!</div>
                <button className="start-test" onClick={handleStart}>Start Test!</button>

                <div className="category-section">
                    <h2>Select category</h2>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c.key} value={c.key}>
                                {c.key} {c.label}
                            </option>
                        ))}
                    </select>
                    <button
                        className="start-test"
                        onClick={handleFetchCategory}
                        disabled={loadingCategory}
                    >
                        {loadingCategory ? 'Loading…' : 'Load category questions'}
                    </button>
                    {categoryError && (
                        <div className="error-screen">{categoryError}</div>
                    )}
                    {categoryInfo && (
                        <div className="category-info">
                            Loaded {categoryInfo.count} questions for: {categoryInfo.name}
                        </div>
                    )}
                </div>
            </div>
        </div>

    )
}