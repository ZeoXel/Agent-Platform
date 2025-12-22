'use client';

export default function DemoPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-800 overflow-hidden">
      {/* 背景装饰元素 - 让模糊效果更明显 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
      </div>

      {/* 底层文字内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white z-0">
          <h1 className="text-6xl font-bold mb-6">Background Text</h1>
          <p className="text-2xl mb-2">这是底层的文字内容，用于测试高斯模糊效果</p>
          <p className="text-2xl mb-2">The quick brown fox jumps over the lazy dog</p>
          <p className="text-2xl">半透明卡片应该能够模糊这些文字</p>
        </div>
      </div>

      {/* 玻璃卡片 */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="
          backdrop-blur-xl
          bg-gradient-to-br from-white/30 to-white/10
          border border-white/30
          rounded-3xl
          p-10
          shadow-2xl
          max-w-md
        ">
          <h2 className="text-2xl font-semibold text-white mb-4">Glass Card</h2>
          <p className="text-white/90">
            这是一个半透明的高斯模糊卡片，使用 backdrop-filter 实现 frosted glass 效果
          </p>
        </div>
      </div>
    </div>
  );
}
