/* 防 AI 味板块的示意场景：每条展示一个典型「AI 味」样子（示例句与界面均为本站自创） */
(function () {
  // 文本口癖类：预览框里放一句自创的反例
  const text = (label, sentence) =>
    `<div class="aif-demo"><span class="aif-tag">${label}</span><p>${sentence}</p><i>✕</i></div>`;

  Object.assign(SCENES, {
    'aif-catch-you': text('稳稳接住', '别怕，把情绪交给我，我稳稳接住。'),
    'aif-single-verbs': text('单字动作', '先把问题收一收，再把结论往上提一层。'),
    'aif-decorative-quotes': text('强行引号', '我们把「好用」重新带回产品里。'),
    'aif-inflated-metaphors': text('夸张比喻', '每次迭代都是一次远征，我们终将抵达对岸。'),
    'aif-raise-the-theme': text('强行拔高', '这不只是一份周报，这是我们对抗混乱的方式。'),
    'aif-engineering-posture': text('黑话连篇', '这版先砍一刀收个口，把链路闭环跑通。'),
    'aif-user-validation': text('先夸一句', '这个问题问得好，你一下抓住了本质。'),
    'aif-not-x-but-y': text('不是而是', '我们要做的不是功能，而是惊喜。'),
    'aif-conclusion-first': text('套话开场', '先说结论：我们分三点展开论述。'),
    'aif-fragmented-bullets': text('逢句必分点', '1. 打开设置。2. 找到通知。3. 关掉提醒。'),
    'aif-if-you-want': text('多余客气', '如果你愿意，我也可以把它改写成一首诗。'),

    // 页面模板感：迷你界面 mockup
    'aif-centered-hero':
      '<div class="aif-demo aif-frame"><span class="aif-tag">首屏</span><div class="dm-hero"><span class="big"></span><span class="mid"></span><span class="cta">立即开始</span></div></div>',
    'aif-three-equal-cards':
      '<div class="aif-demo aif-frame"><span class="aif-tag">特性区</span><div class="aif-cards3"><span><i class="s-img"></i><b>功能一</b></span><span><i class="s-img"></i><b>功能二</b></span><span><i class="s-img"></i><b>功能三</b></span></div></div>',
    'aif-purple-glow':
      '<div class="aif-demo aif-frame aif-glow-demo"><span class="aif-tag">装饰</span><i class="aif-orb"></i><span class="aif-glow-lines"><b></b><u></u></span></div>',
    'aif-rounded-everything':
      '<div class="aif-demo aif-frame"><span class="aif-tag">嵌套</span><div class="aif-box1"><div class="aif-box2"><div class="aif-box3"><span class="ln"></span></div></div></div></div>',
    'aif-divider-everywhere':
      '<div class="aif-demo aif-frame"><span class="aif-tag">分割线</span><div class="aif-divs"><span class="ln"></span><hr class="s-divider"/><span class="ln short"></span><hr class="s-divider"/><span class="ln"></span></div></div>',
    'aif-left-border-callouts':
      '<div class="aif-demo aif-frame"><span class="aif-tag">竖线</span><div class="aif-bars"><span class="aif-bar"><i></i><u></u></span><span class="aif-bar"><i></i><u></u></span><span class="aif-bar"><i></i><u></u></span></div></div>',
    'aif-heavy-headline':
      '<div class="aif-demo aif-frame"><span class="aif-tag">标题</span><div class="aif-heavy"><b>重新定义效率</b><span>每一个字都在用力呐喊</span></div></div>',
    'aif-emoji-icons':
      '<div class="aif-demo aif-frame"><span class="aif-tag">图标</span><div class="aif-emoji-row"><span>🚀<u>极速</u></span><span>💡<u>智能</u></span><span>✅<u>可靠</u></span></div></div>',

    // 不好用的交互：迷你交互 mockup
    'aif-motion-everywhere':
      '<div class="aif-demo aif-frame"><span class="aif-tag">动画</span><div class="aif-motion"><span class="aif-fly f1">↑</span><span class="aif-fly f2">↑</span><span class="aif-fly f3">↑</span><u>加载动画中…</u></div></div>',
    'aif-fake-responsive':
      '<div class="aif-demo aif-frame"><span class="aif-tag">响应式</span><div class="aif-stack"><span class="ln"></span><span class="ln"></span><span class="ln"></span><span class="ln"></span><span class="ln"></span><span class="ln short"></span></div></div>',
    'aif-description-everywhere':
      '<div class="aif-demo aif-frame"><span class="aif-tag">说明</span><div class="aif-tips"><span>昵称<i>?</i></span><span>邮箱<i>?</i></span><span>地区<i>?</i></span></div></div>',
    'aif-naming-drift':
      '<div class="aif-demo aif-frame"><span class="aif-tag">命名</span><div class="aif-drift-row"><span class="b">删除</span><span class="b">移除</span><span class="b">销毁</span><span class="b">清退</span></div></div>',
    'aif-inert-controls':
      '<div class="aif-demo aif-frame"><span class="aif-tag">死按钮</span><div class="aif-inert-row"><span class="b s-btn-primary">提交</span><span class="aif-dead">点我</span></div></div>',
    'aif-icon-button-maze':
      '<div class="aif-demo aif-frame"><span class="aif-tag">图标</span><div class="aif-icons-row"><span>⇄</span><span>⚑</span><span>◈</span><span>✎</span><span>⁂</span></div></div>',
  });
})();
