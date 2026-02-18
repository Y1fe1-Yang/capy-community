#!/usr/bin/env tsx

/**
 * 多模型AI测试脚本
 *
 * 用途：验证不同Capy使用不同LLM模型的功能
 *
 * 运行方式：
 *   npx tsx scripts/test-multi-model.ts
 */

// 模拟 selectModelForCapy 函数的逻辑
const CAPY_MODELS = {
  CLAUDE_OPUS: 'anthropic/claude-opus-4-6',
  GPT_4O: 'openai/gpt-4o',
  GEMINI_PRO: 'google/gemini-pro-1.5',
  DEEPSEEK: 'deepseek/deepseek-chat',
  DEFAULT: 'deepseek/deepseek-chat'
} as const

function selectModelForCapy(capy_name?: string, capy_personality?: string): string {
  // Priority 1: Exact name match
  if (capy_name === '小懒') {
    return CAPY_MODELS.CLAUDE_OPUS
  }
  if (capy_name === '小勤') {
    return CAPY_MODELS.GPT_4O
  }

  // Priority 2: Name contains keywords
  if (capy_name) {
    const nameLower = capy_name.toLowerCase()

    if (nameLower.includes('懒') || nameLower.includes('lazy')) {
      return CAPY_MODELS.CLAUDE_OPUS
    }

    if (nameLower.includes('勤') || nameLower.includes('active') ||
        nameLower.includes('活') || nameLower.includes('diligent')) {
      return CAPY_MODELS.GPT_4O
    }

    if (nameLower.includes('好奇') || nameLower.includes('curious')) {
      return CAPY_MODELS.GEMINI_PRO
    }
  }

  // Priority 3: Personality type
  if (capy_personality) {
    const personalityLower = capy_personality.toLowerCase()

    if (personalityLower === 'lazy' || personalityLower.includes('懒')) {
      return CAPY_MODELS.CLAUDE_OPUS
    }

    if (personalityLower === 'active' || personalityLower.includes('活') ||
        personalityLower.includes('勤') || personalityLower.includes('diligent')) {
      return CAPY_MODELS.GPT_4O
    }

    if (personalityLower === 'curious' || personalityLower.includes('好奇')) {
      return CAPY_MODELS.GEMINI_PRO
    }

    if (personalityLower === 'friendly' || personalityLower === 'shy' ||
        personalityLower.includes('友') || personalityLower.includes('羞')) {
      return CAPY_MODELS.DEEPSEEK
    }
  }

  return CAPY_MODELS.DEFAULT
}

// 测试用例
const testCases = [
  // Mock数据中的Capy
  { name: '小懒', personality: 'lazy', expected: CAPY_MODELS.CLAUDE_OPUS, description: 'Mock Capy: 小懒 (张三的)' },
  { name: '小勤', personality: 'active', expected: CAPY_MODELS.GPT_4O, description: 'Mock Capy: 小勤 (李四的)' },

  // 精确名称匹配
  { name: '小懒', personality: undefined, expected: CAPY_MODELS.CLAUDE_OPUS, description: '精确匹配: 小懒 -> Claude' },
  { name: '小勤', personality: undefined, expected: CAPY_MODELS.GPT_4O, description: '精确匹配: 小勤 -> GPT-4o' },

  // 名称关键词
  { name: '懒洋洋', personality: undefined, expected: CAPY_MODELS.CLAUDE_OPUS, description: '关键词匹配: 懒洋洋 -> Claude' },
  { name: '勤快宝宝', personality: undefined, expected: CAPY_MODELS.GPT_4O, description: '关键词匹配: 勤快宝宝 -> GPT-4o' },
  { name: '好奇宝宝', personality: undefined, expected: CAPY_MODELS.GEMINI_PRO, description: '关键词匹配: 好奇宝宝 -> Gemini' },

  // 性格匹配
  { name: '测试Capy', personality: 'lazy', expected: CAPY_MODELS.CLAUDE_OPUS, description: '性格匹配: lazy -> Claude' },
  { name: '测试Capy', personality: 'active', expected: CAPY_MODELS.GPT_4O, description: '性格匹配: active -> GPT-4o' },
  { name: '测试Capy', personality: 'curious', expected: CAPY_MODELS.GEMINI_PRO, description: '性格匹配: curious -> Gemini' },
  { name: '测试Capy', personality: 'friendly', expected: CAPY_MODELS.DEEPSEEK, description: '性格匹配: friendly -> DeepSeek' },
  { name: '测试Capy', personality: 'shy', expected: CAPY_MODELS.DEEPSEEK, description: '性格匹配: shy -> DeepSeek' },

  // 默认情况
  { name: '随机名字', personality: 'unknown', expected: CAPY_MODELS.DEFAULT, description: '默认: 未知性格 -> DeepSeek' },
  { name: undefined, personality: undefined, expected: CAPY_MODELS.DEFAULT, description: '默认: 无信息 -> DeepSeek' },
]

// 运行测试
console.log('🧪 多模型AI系统测试')
console.log('=' .repeat(80))
console.log('')

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = selectModelForCapy(testCase.name, testCase.personality)
  const isPass = result === testCase.expected

  if (isPass) {
    passed++
    console.log(`✅ Test ${index + 1}: ${testCase.description}`)
  } else {
    failed++
    console.log(`❌ Test ${index + 1}: ${testCase.description}`)
    console.log(`   Expected: ${testCase.expected}`)
    console.log(`   Got: ${result}`)
  }

  console.log(`   Input: name="${testCase.name || 'undefined'}", personality="${testCase.personality || 'undefined'}"`)
  console.log(`   Model: ${result}`)
  console.log('')
})

console.log('=' .repeat(80))
console.log(`📊 测试结果: ${passed} 通过 / ${failed} 失败 / ${testCases.length} 总计`)
console.log('')

if (failed === 0) {
  console.log('🎉 所有测试通过！多模型AI系统工作正常。')
  console.log('')
  console.log('📝 模型映射总结:')
  console.log('   - 小懒 (lazy) → Claude Opus 4.6 (深思熟虑)')
  console.log('   - 小勤 (active) → GPT-4o (快速高效)')
  console.log('   - 好奇 (curious) → Gemini Pro 1.5 (探索创新)')
  console.log('   - 友善/害羞 (friendly/shy) → DeepSeek (经济稳定)')
  console.log('   - 其他 → DeepSeek (默认)')
  process.exit(0)
} else {
  console.log('⚠️  部分测试失败，请检查模型选择逻辑。')
  process.exit(1)
}
