import './HomePage.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { CATEGORIES } from '../const/categories.js'

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function HomePage({ setTimerBool, selectedCategory, setSelectedCategory }) {

    const navigate = useNavigate();
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState(null);

    const handleStart = () => {
        navigate('/main-test-page')
        setTimerBool(true)
        // setSelectedCategory(CATEGORIES[0].key)
    }

    const handleStartCategoryTest = async () => {
        try {
            setLoadingCategory(true);
            setCategoryError(null);
            setCategoryInfo(null);
            const categoryKey = selectedCategory

            if (!categoryKey) {
                throw new Error('Category key is required');
            }
            navigate(`/main-test-page/category-${categoryKey}`, { state: { categoryKey: categoryKey } })
            setTimerBool(true)
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
                <div className="test-header">Добро пожаловать в Тест Судового Эксперта!</div>
                <button className="start-test" onClick={handleStart}>Начать тест по всем категориям</button>

                <div className="category-section">
                    <h2>Тест по категориям:</h2>
                    <div className="category-select-container">
                        <div className="category-select-label">Выберите категорию:
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
                        </div>
                        <div className="button-label">
                            <button
                                className="start-test"
                                onClick={handleStartCategoryTest}
                                disabled={loadingCategory}
                            >
                                {loadingCategory ? 'Загрузка…' : 'Начать тест по выбранной категории'}
                            </button>
                        </div>
                    </div>
                    {categoryError && (
                        <div className="error-screen">"Ошибка при загрузке вопросов: "{categoryError}</div>
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