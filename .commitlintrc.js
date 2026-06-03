module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // Nueva funcionalidad
        'fix',       // Arreglo de bug
        'hotfix',    // Arreglo urgente en producción
        'docs',      // Cambios en documentación
        'style',     // Cambios de formato (no afectan lógica)
        'refactor',  // Refactorización de código
        'perf',      // Mejora de performance
        'test',      // Agregar o actualizar tests
        'build',     // Cambios en build o dependencias
        'ci',        // Cambios en CI/CD
        'chore',     // Cambios generales (actualización de dependencias, etc)
        'revert',    // Revertir un commit anterior
        'wip',       // Work in progress (no debe hacer merge a main)
      ],
    ],
    'type-case': [2, 'always', 'lowercase'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lowercase'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-period': [2, 'never'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  prompt: {
    settings: {
      enableMultiline: true,
    },
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyNotAllowed: 'empty not allowed',
      upperLimitExceeded: 'upper limit exceeded',
      commit: 'Commit',
    },
    questions: {
      type: {
        description: 'Selecciona el tipo de cambio:',
        enum: {
          feat: '✨ Nueva funcionalidad',
          fix: '🐛 Arreglo de bug',
          hotfix: '🚨 Arreglo urgente en producción',
          docs: '📚 Documentación',
          style: '💄 Formato/estilo (no afecta lógica)',
          refactor: '♻️  Refactorización',
          perf: '⚡ Mejora de performance',
          test: '✅ Tests',
          build: '🔨 Build/dependencias',
          ci: '🤖 CI/CD',
          chore: '🧹 Mantenimiento',
          revert: '⏮️  Revert',
          wip: '🚧 Work in progress',
        },
      },
      scope: {
        description: 'Scope (opcional, ej: auth, inventory, ui):',
      },
      subject: {
        description: 'Descripción corta en presente imperativo:',
      },
      body: {
        description: 'Descripción detallada (opcional):',
      },
      isBreaking: {
        description: '¿Contiene breaking changes?',
      },
      breakingBody: {
        description: 'Describe los breaking changes:',
      },
      footer: {
        description: 'Footer con referencias a issues (opcional, ej: Closes #123):',
      },
      confirmCommit: {
        description: '¿Confirmar commit?',
      },
    },
  },
}
