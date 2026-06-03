# Changelog

## 2.2.8
- fix(start): `YandexSync.init()` перенесён в `Promise.all` — меню показывается только после загрузки облачных данных (счёт, валюта, скины); ранее меню могло отрисоваться с локальными данными до прихода облака
- fix(yandex_sync): добавлен guard `if (_initialized) return` в `init()` для идемпотентности

## 2.2.7
- fix(screen_menu): `_resumeMenuMusic()` перенесена перед `Audio.systemResume()` в `showMenu()` — `_bgName` становится `'menu'` до того как `systemResume` вызывает `play()`, исключая запуск game-трека при возврате из паузы в меню

## 2.2.6
- fix(audio): `resumeAfterAd` теперь вызывает `play()` с проверкой guard — музыка возобновляется после рекламы в магазине
- fix(start): `setResumeGuard` расширен до `phase === 'playing' || phase === 'idle'`

## 2.2.5
- revert(player): glow возвращён к оригинальному подходу из v2.0.6 — `ctx.shadowBlur` перед `drawImage` спрайта; убраны `glowCfg`, `glowColor`, `glowOverride`, offscreen-кеш и многопроходный stroke

## 2.2.1
- fix(physics): `checkDeath` теперь проверяет `phase === 'playing'` перед вызовом `showGameOver`
- fix(start): в `startGame` порядок изменён на `forceResume` → `switchTo('game')`