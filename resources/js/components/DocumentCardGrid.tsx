import React from 'react';

interface DocumentCardGridProps<T> {
    items: T[];
    getKey: (item: T) => React.Key;
    onCardClick: (item: T) => void;
    renderCardContent: (item: T, index: number) => React.ReactNode;
    className?: string;
    gridClassName?: string;
}

export function DocumentCardGrid<T>({
    items,
    getKey,
    onCardClick,
    renderCardContent,
    className = '',
    gridClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
}: DocumentCardGridProps<T>) {
    return (
        <div className={className}>
            <div className={gridClassName}>
                {items.map((item, index) => (
                    <div
                        key={getKey(item)}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 cursor-pointer border-t-4 overflow-hidden flex flex-col"
                        style={{
                            borderTopColor: '#7F0404',
                            animationDelay: `${index * 0.1}s`,
                        }}
                        onClick={() => onCardClick(item)}
                    >
                        {renderCardContent(item, index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
