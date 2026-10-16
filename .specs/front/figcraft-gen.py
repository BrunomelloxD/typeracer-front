"""Gera SVGs das telas TypeRace (direção A — Graphite & Brass) para importar no FigCraft.
Texto de UI usa id "uiNNN · nome" para corrigir a fonte (Source Sans 3) depois da importação."""
import math, os, sys
from xml.sax.saxutils import escape

OUT = sys.argv[1] if len(sys.argv) > 1 else 'svg'
os.makedirs(OUT, exist_ok=True)

C = dict(
    bg='#0E0F12', surface='#16181D', surface2='#1D2027', core='#121419', line='#2A2D35',
    text='#E8E6E1', muted='#8A8F98', untyped='#80858F', accent='#E2B75A', on_accent='#0E0F12',
    rival='#7FA7C9', error='#F0716B', ok='#7BC89A',
)
UI = 'Arial'  # placeholder; trocado por Source Sans 3 após import
MONO = 'JetBrains Mono'
SAMPLE = ('A prática constante transforma esforço em hábito. Quem digita sem olhar para o '
          'teclado ganha velocidade aos poucos, mas a precisão vem primeiro: cada erro custa '
          'mais tempo do que uma tecla pressionada com calma.')

_n = [0]
def uid(name):
    _n[0] += 1
    return f'{name}'

def tw(s, size, w=400, mono=False):
    if mono:
        return len(s) * size * 0.6
    f = {400: 0.44, 600: 0.475, 700: 0.49}[w]
    return len(s) * size * f

def rect(x, y, w, h, fill='none', rx=0, stroke=None, sop=1.0, fop=1.0, sw=1, dash=None, name=None, op=None):
    a = f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}"'
    if rx: a += f' rx="{rx}"'
    a += f' fill="{fill}"'
    if fop != 1: a += f' fill-opacity="{fop}"'
    if stroke: a += f' stroke="{stroke}" stroke-width="{sw}"' + (f' stroke-opacity="{sop}"' if sop != 1 else '')
    if dash: a += f' stroke-dasharray="{dash}"'
    if op is not None: a += f' opacity="{op}"'
    if name: a += f' id="{escape(name)}"'
    return a + '/>'

def circle(cx, cy, r, fill, fop=1.0, name=None):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"' + (f' fill-opacity="{fop}"' if fop != 1 else '')
            + (f' id="{name}"' if name else '') + '/>')

def line(x1, y1, x2, y2, stroke, sw=1, sop=1.0, dash=None):
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"'
            + (f' stroke-opacity="{sop}"' if sop != 1 else '') + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')

def t(x, top, s, size=16, fill=None, w=400, mono=False, ls=0, name=None, align='left', op=None):
    """top = topo da caixa de texto. align calcula x pelo tamanho estimado."""
    fill = fill or C['text']
    width = tw(s, size, w, mono)
    if align == 'center': x = x - width / 2
    elif align == 'right': x = x - width
    base = top + size * 0.82
    fam = MONO if mono else UI
    nm = name or (('mono · ' if mono else f'ui{w} · ') + s[:28])
    if not mono and not nm.startswith('ui'): nm = f'ui{w} · {nm}'
    a = (f'<text id="{escape(nm)}" x="{x:.1f}" y="{base:.1f}" font-family="{fam}" font-size="{size}" '
         f'font-weight="{w}" fill="{fill}" xml:space="preserve"')
    if ls: a += f' letter-spacing="{ls}"'
    if op is not None: a += f' opacity="{op}"'
    return a + f'>{escape(s)}</text>'

def g(name, *items, op=None):
    return f'<g id="{escape(name)}"' + (f' opacity="{op}"' if op is not None else '') + '>' + ''.join(items) + '</g>'

def svg(w, h, body, name):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" id="{escape(name)}">'
            + rect(0, 0, w, h, C['bg'], name='Fundo') + body + '</svg>')

# ---------- componentes ----------
def kbd(x, y, label, on_accent=False, size=12):
    w = max(22, tw(label, size, mono=True) + 12)
    if on_accent:
        r = rect(x, y, w, 22, C['on_accent'], rx=6, fop=0.14)
        col = C['on_accent']
    else:
        r = rect(x, y, w, 22, C['surface2'], rx=6, stroke=C['line']) + rect(x + 1, y + 20, w - 2, 2, C['line'], rx=1)
        col = C['muted']
    return g(f'Kbd · {label}', r, t(x + w / 2, y + 4.5, label, size, col, mono=True, align='center')), w

def button(x, y, label, kind='primary', kbd_label=None, h=44, size=15, icon=None, width=None):
    lw = tw(label, size, 600)
    kw = (tw(kbd_label, 12, mono=True) + 12 if kbd_label else 0)
    kw = max(22, kw) if kbd_label else 0
    w = 22 + lw + (14 + kw if kbd_label else 0) + 22
    lx = x + 22
    if width:
        lx = x + (width - lw - (10 + kw if kbd_label else 0)) / 2
        w = width
    items = []
    if kind == 'primary':
        items.append(rect(x, y, w, h, C['accent'], rx=h / 2))
        col = C['on_accent']
    elif kind == 'secondary':
        items.append(rect(x, y, w, h, C['surface2'], rx=h / 2, stroke=C['line']))
        col = C['text']
    elif kind == 'ghost':
        col = C['muted']
    elif kind == 'danger':
        items.append(rect(x, y, w, h, 'none', rx=h / 2, stroke=C['error'], sop=0.5))
        col = C['error']
    items.append(t(lx, y + (h - size) / 2 - 1, label, size, col, 600))
    if kbd_label:
        k, _ = kbd(lx + lw + 14, y + (h - 22) / 2, kbd_label, on_accent=(kind == 'primary'))
        items.append(k)
    return g(f'Botão/{kind} · {label}', *items), w

def badge(x, y, state):
    m = {'ok': ('Conectado', C['ok']), 'connecting': ('Conectando…', C['muted']),
         'reconnecting': ('Reconectando…', C['accent']), 'offline': ('Sem conexão', C['error'])}
    label, col = m[state]
    w = 30 + tw(label, 13, 600) + 14
    return g(f'Badge conexão · {label}', rect(x, y, w, 28, col, rx=14, fop=0.10, stroke=col, sop=0.28),
             circle(x + 15, y + 14, 4, col), t(x + 26, y + 6.5, label, 13, col, 600)), w

def chip(x, y, label, col=None):
    col = col or C['muted']
    w = tw(label, 13) + 20
    return g(f'Chip · {label}', rect(x, y, w, 26, C['surface2'], rx=8, stroke=C['line']), t(x + 10, y + 6, label, 13, col)), w

def avatar(x, y, letter, col, size=28, dashed=False):
    if dashed:
        return g('Avatar vazio', rect(x, y, size, size, 'none', rx=8, stroke=C['line'], dash='3 3'))
    return g(f'Avatar · {letter}', rect(x, y, size, size, col, rx=8, fop=0.16),
             t(x + size / 2, y + (size - 14) / 2 - 1, letter, 14, col, 700, align='center'))

def bezel(x, y, w, h, name='Palco', ring=None, ring_op=0.06):
    """Double-bezel: moldura + núcleo."""
    ring = ring or '#FFFFFF'
    return g(name, rect(x, y, w, h, C['surface'], rx=22, stroke=ring, sop=ring_op),
             rect(x + 6, y + 6, w - 12, h - 12, C['core'], rx=16, stroke='#FFFFFF', sop=0.04))

def wrap(text, maxc):
    lines, cur, start = [], '', 0
    i = 0
    words = text.split(' ')
    for wi, wd in enumerate(words):
        token = wd + (' ' if wi < len(words) - 1 else '')
        if len(cur) + len(wd) > maxc and cur:
            lines.append((start, cur))
            start += len(cur)
            cur = ''
        cur += token
    if cur: lines.append((start, cur))
    return lines

def typing(x, y, width, text, typed, errors=(), size=28, lh=48, caret=True, max_lines=None, all_dim=False):
    cw = size * 0.6
    maxc = int(width // cw)
    lines = wrap(text, maxc)
    if max_lines: lines = lines[:max_lines]
    errs = set(errors)
    out = []
    for li, (start, s) in enumerate(lines):
        top = y + li * lh
        base = top + lh / 2 + size * 0.36
        spans, cur_state, buf = [], None, ''
        for ci, ch in enumerate(s):
            idx = start + ci
            if all_dim: st = 'untyped'
            elif idx < typed: st = 'error' if idx in errs else 'ok'
            else: st = 'untyped'
            if idx in errs and idx < typed and not all_dim:
                bx = x + ci * cw
                out.append(rect(bx - 1, top + (lh - size * 1.3) / 2, cw + 2, size * 1.3, C['error'], rx=4, fop=0.14))
                if ch == ' ':
                    out.append(rect(bx + 2, top + lh / 2 + size * 0.5, cw - 4, 2, C['error'], rx=1))
            if st != cur_state and buf:
                spans.append((cur_state, buf)); buf = ''
            cur_state = st
            buf += ch
        if buf: spans.append((cur_state, buf))
        col = {'ok': C['text'], 'error': C['error'], 'untyped': C['untyped']}
        ts = ''.join(f'<tspan fill="{col[s_]}">{escape(b)}</tspan>' for s_, b in spans)
        out.append(f'<text id="mono · linha {li + 1}" x="{x:.1f}" y="{base:.1f}" font-family="{MONO}" '
                   f'font-size="{size}" fill="{C["untyped"]}" xml:space="preserve">{ts}</text>')
        if caret and not all_dim and start <= typed < start + len(s):
            cx = x + (typed - start) * cw
            out.append(rect(cx - 1, top + (lh - size * 1.2) / 2, 2.5, size * 1.2, C['accent'], rx=1.25, name='Caret'))
    return g('Texto de digitação', *out), len(lines)

def header(W, active=None, player='Rafa', op=None, mobile=False):
    pad = 16 if mobile else 160
    items = [rect(0, 0, W, 64 if not mobile else 56, C['bg']), line(0, (64 if not mobile else 56) - 0.5, W, (64 if not mobile else 56) - 0.5, '#FFFFFF', sop=0.06)]
    hh = 56 if mobile else 64
    items.append(g('Logo', t(pad, hh / 2 - 10, 'type', 18, C['accent'], mono=True, name='mono · type'),
                   t(pad + 43.2, hh / 2 - 10, 'race', 18, C['text'], mono=True, name='mono · race')))
    x = W - pad
    # jogador
    pw = tw(player, 14, 600)
    x -= pw
    items.append(t(x, hh / 2 - 9, player, 14, C['text'], 600))
    x -= 34
    items.append(avatar(x, hh / 2 - 13, player[0], C['accent'], 26))
    if not mobile:
        x -= 20
        items.append(line(x, hh / 2 - 10, x, hh / 2 + 10, C['line']))
        for lab in ['Duelo', 'Solo'][::1]:
            pass
        for lab in reversed(['Solo', 'Duelo']):
            w = tw(lab, 14, 600) + 28
            x -= w + 6
            if lab == active:
                items.append(rect(x, hh / 2 - 17, w, 34, C['surface2'], rx=17, stroke=C['line']))
            items.append(t(x + 14, hh / 2 - 9, lab, 14, C['text'] if lab == active else C['muted'], 600))
    return g('Header', *items, op=op)

def lane(x, y, w, name, tag, pct, col, right_label, label_w=170, mobile=False):
    items = []
    items.append(avatar(x, y + 2, name[0], col, 28))
    items.append(t(x + 38, y + 1, name, 15, col, 600))
    if tag:
        items.append(t(x + 38, y + 19, tag, 12, C['muted']))
    tx = x + label_w
    tr_w = w - label_w - (90 if not mobile else 52)
    ty = y + 15
    items.append(rect(tx, ty - 2, tr_w, 4, C['line'], rx=2))
    items.append(rect(tx, ty - 2, tr_w * pct, 4, col, rx=2))
    # marcador
    mx = tx + tr_w * pct
    items.append(rect(mx - 12, ty - 9, 24, 18, col, rx=9, name='Marcador'))
    items.append(rect(mx - 4, ty - 2, 8, 4, C['bg'], rx=2, fop=0.5))
    # chegada
    items.append(line(tx + tr_w + 0.5, y - 2, tx + tr_w + 0.5, y + 32, C['muted'], sop=0.5, dash='3 3'))
    items.append(t(x + w, y + 6, right_label, 15, C['text'], mono=True, align='right'))
    return g(f'Faixa · {name}', *items)

def keyboard(W, y, H):
    items = [rect(0, y, W, H, '#202329'), t(W / 2, y + 8, 'teclado do sistema', 11, C['muted'], align='center', op=0.7)]
    rows = [10, 9, 7]
    kw = (W - 12 - 9 * 6) / 10
    for ri, n in enumerate(rows):
        total = n * kw + (n - 1) * 6
        x0 = (W - total) / 2
        for k in range(n):
            items.append(rect(x0 + k * (kw + 6), y + 30 + ri * 54, kw, 44, '#2F333B', rx=6))
    items.append(rect(W * 0.25, y + 30 + 3 * 54, W * 0.5, 44, '#2F333B', rx=6))
    return g('Teclado do sistema (referência)', *items)

def metrics(x, y, timer='42', wpm='84', acc='97,3', big=48, small=30, mobile=False):
    items = []
    items.append(t(x, y, timer, big, C['accent'], mono=True, name='mono · tempo'))
    tx = x + tw(timer, big, mono=True) + 4
    items.append(t(tx, y + big - 22, 's', 16, C['muted'], name='ui400 · s'))
    x2 = tx + (36 if not mobile else 26)
    items.append(t(x2, y + big - small - 2, wpm, small, C['text'], mono=True, name='mono · wpm'))
    x3 = x2 + tw(wpm, small, mono=True) + 6
    items.append(t(x3, y + big - 22, 'wpm', 14, C['muted']))
    x4 = x3 + (56 if not mobile else 44)
    items.append(t(x4, y + big - small - 2, acc + '%', small, C['text'], mono=True, name='mono · precisão'))
    x5 = x4 + tw(acc + '%', small, mono=True) + 6
    items.append(t(x5, y + big - 22, 'precisão', 14, C['muted']))
    return g('Métricas', *items)

def segmented(x, y, opts, active, op=None):
    items, cx = [], x + 4
    widths = [tw(o, 13, 600) + 24 for o in opts]
    total = sum(widths) + 8
    items.append(rect(x, y, total, 36, C['surface'], rx=18, stroke=C['line']))
    for o, w in zip(opts, widths):
        if o == active:
            items.append(rect(cx, y + 4, w, 28, C['surface2'], rx=14, stroke='#FFFFFF', sop=0.08))
        items.append(t(cx + 12, y + 11, o, 13, C['text'] if o == active else C['muted'], 600))
        cx += w
    return g('Dificuldade', *items, op=op), total

# ---------- telas ----------
def home_desktop():
    W, H = 1440, 900
    b = [header(W)]
    L = 160
    b.append(g('Eyebrow', rect(L, 176, 236, 28, C['surface'], rx=14, stroke=C['line']),
               circle(L + 16, 190, 3.5, C['accent']), t(L + 28, 182, 'Desafio de digitação · 60 s', 13, C['muted'], 600)))
    b.append(t(L, 230, 'Digite rápido.', 76, C['text'], 600, ls=-2))
    # linha 2 com efeito digitação
    s2 = 'Erre pouco.'
    b.append(g('Título linha 2',
               f'<text id="ui600 · Erre pouco." x="{L}" y="{318 + 62:.1f}" font-family="{UI}" font-size="76" font-weight="600" letter-spacing="-2" xml:space="preserve"><tspan fill="{C["text"]}">Erre </tspan><tspan fill="{C["untyped"]}">pouco.</tspan></text>',
               rect(L + 140, 322, 4, 70, C['accent'], rx=2, name='Caret')))
    b.append(t(L, 424, 'Corridas de 60 segundos contra o relógio ou contra', 19, C['muted']))
    b.append(t(L, 450, 'outra pessoa. O WPM conta só caracteres certos.', 19, C['muted']))
    # campo nome
    b.append(t(L, 516, 'Seu nome', 14, C['text'], 600))
    b.append(g('Campo nome', bezel(L, 540, 460, 68, 'Input'),
               t(L + 24, 562, 'Rafa', 20, C['text'], 400), rect(L + 66, 560, 2, 28, C['accent'], rx=1, name='Caret')))
    b.append(t(L, 620, 'Aparece no ranking e para quem disputar com você.', 14, C['muted']))
    # cards de modo
    R = 760; RW = 520
    b.append(g('Card Solo', bezel(R, 176, RW, 240, 'Moldura Solo', ring=C['accent'], ring_op=0.35)))
    b.append(t(R + 36, 210, 'Solo', 30, C['text'], 600))
    cx = R + 36
    for lab in ['1 jogador', '60 s', '3 níveis']:
        c, w = chip(cx, 256, lab); b.append(c); cx += w + 8
    b.append(t(R + 36, 298, 'Texto aleatório. O tempo começa na primeira tecla.', 16, C['muted']))
    btn, _ = button(R + 36, 340, 'Começar solo', 'primary', '↵ Enter', h=48)
    b.append(btn)
    b.append(g('Card Duelo', bezel(R, 440, RW, 240, 'Moldura Duelo')))
    b.append(t(R + 36, 474, 'Duelo', 30, C['text'], 600))
    cx = R + 36
    for lab in ['2 jogadores', 'tempo real', 'link ou código']:
        c, w = chip(cx, 520, lab); b.append(c); cx += w + 8
    b.append(t(R + 36, 562, 'Crie uma sala e mande o link, ou entre com 6 dígitos.', 16, C['muted']))
    btn, _ = button(R + 36, 604, 'Ir para o duelo', 'secondary', h=48)
    b.append(btn)
    # faixa de stats
    b.append(line(L, 744.5, L + 1120, 744.5, '#FFFFFF', sop=0.06))
    sx = L
    for lab, val in [('Melhor', '91 wpm'), ('Média', '78 wpm'), ('Partidas', '12'), ('Precisão média', '96,4%')]:
        b.append(t(sx, 772, lab, 13, C['muted']))
        b.append(t(sx, 794, val, 22, C['text'], mono=True))
        sx += 220
    b.append(g('Atalhos', t(L + 1120, 800, 'Enter começa o solo · Tab navega', 13, C['muted'], align='right')))
    return svg(W, H, ''.join(b), 'Home — Desktop 1440')

def home_mobile():
    W, H = 390, 1180
    b = [header(W, mobile=True)]
    L = 16
    b.append(g('Eyebrow', rect(L, 88, 214, 26, C['surface'], rx=13, stroke=C['line']),
               circle(L + 14, 101, 3, C['accent']), t(L + 24, 94, 'Desafio de digitação · 60 s', 12, C['muted'], 600)))
    b.append(t(L, 132, 'Digite rápido.', 44, C['text'], 600, ls=-1))
    b.append(g('Título linha 2',
               f'<text id="ui600 · Erre pouco." x="{L}" y="{184 + 36:.1f}" font-family="{UI}" font-size="44" font-weight="600" letter-spacing="-1" xml:space="preserve"><tspan fill="{C["text"]}">Erre </tspan><tspan fill="{C["untyped"]}">pouco.</tspan></text>',
               rect(L + 82, 186, 3, 42, C['accent'], rx=1.5, name='Caret')))
    b.append(t(L, 250, 'Corridas de 60 s contra o relógio ou contra', 16, C['muted']))
    b.append(t(L, 272, 'outra pessoa. O WPM conta só acertos.', 16, C['muted']))
    b.append(t(L, 320, 'Seu nome', 14, C['text'], 600))
    b.append(g('Campo nome', bezel(L, 344, 358, 60, 'Input'),
               t(L + 22, 363, 'Rafa', 18, C['text']), rect(L + 60, 360, 2, 26, C['accent'], rx=1, name='Caret')))
    b.append(t(L, 414, 'Aparece no ranking e para o oponente.', 13, C['muted']))
    b.append(g('Card Solo', bezel(L, 456, 358, 236, 'Moldura Solo', ring=C['accent'], ring_op=0.35)))
    b.append(t(L + 26, 484, 'Solo', 26, C['text'], 600))
    cx = L + 26
    for lab in ['1 jogador', '60 s', '3 níveis']:
        c, w = chip(cx, 524, lab); b.append(c); cx += w + 6
    b.append(t(L + 26, 566, 'Texto aleatório. O tempo começa', 15, C['muted']))
    b.append(t(L + 26, 586, 'na primeira tecla.', 15, C['muted']))
    btn, _ = button(L + 26, 622, 'Começar solo', 'primary', h=48, width=306)
    b.append(btn)
    b.append(g('Card Duelo', bezel(L, 712, 358, 236, 'Moldura Duelo')))
    b.append(t(L + 26, 740, 'Duelo', 26, C['text'], 600))
    cx = L + 26
    for lab in ['2 jogadores', 'tempo real', 'link']:
        c, w = chip(cx, 780, lab); b.append(c); cx += w + 6
    b.append(t(L + 26, 822, 'Crie uma sala e mande o link, ou', 15, C['muted']))
    b.append(t(L + 26, 842, 'entre com 6 dígitos.', 15, C['muted']))
    btn, _ = button(L + 26, 878, 'Ir para o duelo', 'secondary', h=48, width=306)
    b.append(btn)
    b.append(line(L, 980.5, W - L, 980.5, '#FFFFFF', sop=0.06))
    for i, (lab, val) in enumerate([('Melhor', '91 wpm'), ('Média', '78 wpm'), ('Partidas', '12'), ('Precisão', '96,4%')]):
        x = L + (i % 2) * 180; y = 1004 + (i // 2) * 64
        b.append(t(x, y, lab, 13, C['muted'])); b.append(t(x, y + 20, val, 20, C['text'], mono=True))
    return svg(W, H, ''.join(b), 'Home — Mobile 390')

def solo_desktop():
    W, H = 1440, 900
    b = [header(W, 'Solo', op=0.35)]
    SX, SW = 200, 1040
    b.append(metrics(SX, 132))
    seg, sw = segmented(SX + SW - 300, 140, ['Fácil', 'Médio', 'Difícil'], 'Médio', op=0.35)
    b.append(seg)
    nb, _ = button(SX + SW - 300 + sw + 12, 136, 'Novo texto', 'ghost', h=44)
    b.append(g('Novo texto (recua)', nb, op=0.35))
    lines = 4; lh = 50
    b.append(bezel(SX, 220, SW, lines * lh + 96, 'Palco do texto'))
    tx, _ = typing(SX + 52, 268, SW - 104, SAMPLE, 74, errors=(41, 59), size=28, lh=lh, max_lines=lines)
    b.append(tx)
    py = 220 + lines * lh + 96 + 24
    b.append(g('Progresso', rect(SX, py, SW, 3, C['line'], rx=1.5), rect(SX, py, SW * 0.34, 3, C['accent'], rx=1.5)))
    hx = W / 2 - 170
    items = []
    k, w1 = kbd(hx, py + 32, 'Tab'); items.append(k)
    items.append(t(hx + w1 + 6, py + 34, '+', 13, C['muted']))
    k, w2 = kbd(hx + w1 + 20, py + 32, 'Enter'); items.append(k)
    items.append(t(hx + w1 + w2 + 28, py + 34, 'reinicia', 13, C['muted']))
    k, w3 = kbd(hx + w1 + w2 + 110, py + 32, 'Esc'); items.append(k)
    items.append(t(hx + w1 + w2 + w3 + 118, py + 34, 'troca o texto', 13, C['muted']))
    b.append(g('Atalhos', *items))
    b.append(t(W / 2, 820, 'Modo foco: header, dificuldade e histórico recuam enquanto você digita.', 13, C['muted'], align='center', op=0.6))
    return svg(W, H, ''.join(b), 'Solo em andamento — Desktop 1440')

def solo_mobile():
    W, H = 390, 844
    b = [header(W, op=0.35, mobile=True)]
    b.append(metrics(16, 76, big=36, small=22, mobile=True))
    lines, lh = 6, 34
    b.append(bezel(16, 134, 358, lines * lh + 52, 'Palco do texto'))
    tx, _ = typing(16 + 26, 160, 358 - 52, SAMPLE, 74, errors=(41, 59), size=20, lh=lh, max_lines=lines)
    b.append(tx)
    py = 134 + lines * lh + 52 + 16
    b.append(g('Progresso', rect(16, py, 358, 3, C['line'], rx=1.5), rect(16, py, 358 * 0.34, 3, C['accent'], rx=1.5)))
    rb, _ = button(16, py + 18, 'Reiniciar', 'secondary', h=40, size=14)
    b.append(rb)
    b.append(keyboard(W, 844 - 260, 260))
    return svg(W, H, ''.join(b), 'Solo em andamento — Mobile 390')

def code_slots(cx, y, code, box_w=72, box_h=88, gap=12, size=44):
    total = 6 * box_w + 5 * gap
    x0 = cx - total / 2
    items = []
    for i, d in enumerate(code):
        x = x0 + i * (box_w + gap)
        items.append(rect(x, y, box_w, box_h, C['surface2'], rx=14, stroke=C['line']))
        items.append(t(x + box_w / 2, y + (box_h - size) / 2 - 2, d, size, C['accent'], mono=True, align='center', name=f'mono · dígito {i + 1}'))
    return g('Código da sala', *items)

def waiting_desktop():
    W, H = 1440, 900
    b = [header(W, 'Duelo')]
    gb, _ = button(160, 96, '← Sair da sala', 'ghost', 'Esc', h=40, size=14)
    b.append(gb)
    bd, bw = badge(1280 - 116, 102, 'ok'); b.append(bd)
    CX, CW = 380, 680
    b.append(bezel(CX, 168, CW, 636, 'Card sala'))
    b.append(t(W / 2, 208, 'Sala criada', 13, C['accent'], 600, align='center', ls=0.5))
    b.append(t(W / 2, 232, 'Chame alguém para correr', 34, C['text'], 600, align='center', ls=-0.5))
    b.append(code_slots(W / 2, 300, '482173'))
    # link
    lx = CX + 60
    b.append(g('Link convite', rect(lx, 418, CW - 120, 52, C['surface2'], rx=26, stroke=C['line']),
               t(lx + 22, 435, 'typerace.app/duel?code=482173', 15, C['muted'], mono=True)))
    pb, pw = button(lx + CW - 120 - 150, 422, 'Copiar link', 'primary', h=44)
    b.append(pb)
    b.append(t(W / 2, 486, 'ou só o código', 13, C['muted'], align='center'))
    sb, sw_ = button(W / 2 - 70, 508, 'Copiar código', 'secondary', h=40, size=14)
    b.append(sb)
    # presença
    b.append(line(CX + 40, 578.5, CX + CW - 40, 578.5, '#FFFFFF', sop=0.06))
    b.append(t(CX + 60, 598, 'Jogadores', 14, C['text'], 600))
    b.append(t(CX + CW - 60, 598, '1/2', 14, C['muted'], mono=True, align='right'))
    b.append(g('Jogador · Rafa', avatar(CX + 60, 632, 'R', C['accent'], 32), t(CX + 104, 638, 'Rafa', 16, C['text'], 600),
               t(CX + 146, 640, 'você', 12, C['accent'], 600), circle(CX + CW - 120, 648, 4, C['ok']),
               t(CX + CW - 108, 639, 'pronto', 14, C['ok'])))
    b.append(g('Vaga oponente', avatar(CX + 60, 684, '', C['muted'], 32, dashed=True),
               t(CX + 104, 690, 'Aguardando oponente…', 16, C['untyped']),
               circle(CX + CW - 96, 700, 3, C['muted']), circle(CX + CW - 84, 700, 3, C['muted'], fop=0.6), circle(CX + CW - 72, 700, 3, C['muted'], fop=0.3)))
    b.append(t(W / 2, 752, 'A partida começa sozinha quando o oponente entrar: contagem de 3 s.', 14, C['muted'], align='center'))
    return svg(W, H, ''.join(b), 'Duel aguardando oponente — Desktop 1440')

def waiting_mobile():
    W, H = 390, 844
    b = [header(W, mobile=True)]
    gb, _ = button(4, 72, '← Sair', 'ghost', h=40, size=14)
    b.append(gb)
    bd, bw = badge(W - 16 - 116, 78, 'ok'); b.append(bd)
    b.append(bezel(16, 128, 358, 596, 'Card sala'))
    b.append(t(W / 2, 160, 'Sala criada', 13, C['accent'], 600, align='center'))
    b.append(t(W / 2, 182, 'Chame alguém para correr', 24, C['text'], 600, align='center'))
    b.append(code_slots(W / 2, 236, '482173', box_w=44, box_h=60, gap=8, size=28))
    pb, _ = button(40, 324, 'Copiar link de convite', 'primary', h=48, width=310)
    b.append(pb)
    b.append(t(W / 2, 384, 'typerace.app/duel?code=482173', 12, C['muted'], mono=True, align='center'))
    sb, _ = button(40, 412, 'Copiar código', 'secondary', h=44, size=14, width=310)
    b.append(sb)
    b.append(line(40, 488.5, 350, 488.5, '#FFFFFF', sop=0.06))
    b.append(t(40, 506, 'Jogadores', 14, C['text'], 600))
    b.append(t(350, 506, '1/2', 14, C['muted'], mono=True, align='right'))
    b.append(g('Jogador · Rafa', avatar(40, 540, 'R', C['accent'], 32), t(84, 546, 'Rafa', 16, C['text'], 600),
               t(124, 548, 'você', 12, C['accent'], 600), circle(298, 556, 4, C['ok']), t(308, 547, 'pronto', 13, C['ok'])))
    b.append(g('Vaga oponente', avatar(40, 590, '', C['muted'], 32, dashed=True), t(84, 597, 'Aguardando oponente…', 15, C['untyped'])))
    b.append(t(W / 2, 660, 'Começa sozinho quando o oponente', 13, C['muted'], align='center'))
    b.append(t(W / 2, 678, 'entrar: contagem de 3 s.', 13, C['muted'], align='center'))
    return svg(W, H, ''.join(b), 'Duel aguardando oponente — Mobile 390')

def duel_desktop():
    W, H = 1440, 900
    b = [header(W, 'Duelo', op=0.35)]
    SX, SW = 200, 1040
    b.append(g('Pista', rect(SX, 96, SW, 136, C['surface'], rx=20, stroke='#FFFFFF', sop=0.06),
               lane(SX + 28, 118, SW - 56, 'Rafa', 'você', 0.46, C['accent'], '46%'),
               lane(SX + 28, 174, SW - 56, 'Marina', 'oponente', 0.38, C['rival'], '38%')))
    b.append(g('Sala', t(SX, 250, 'Sala 482173', 13, C['muted'], mono=True)))
    bd, bw = badge(SX + SW - 116, 246, 'ok'); b.append(bd)
    b.append(metrics(SX, 290))
    lines, lh = 4, 50
    b.append(bezel(SX, 370, SW, lines * lh + 96, 'Palco do texto'))
    tx, _ = typing(SX + 52, 418, SW - 104, SAMPLE, 98, errors=(87,), size=28, lh=lh, max_lines=lines)
    b.append(tx)
    b.append(t(W / 2, 726, 'Um só texto, largura total. O oponente aparece na pista, não numa segunda cópia do texto.', 13, C['muted'], align='center', op=0.6))
    return svg(W, H, ''.join(b), 'Duel em andamento — Desktop 1440')

def duel_mobile():
    W, H = 390, 844
    b = [header(W, op=0.35, mobile=True)]
    b.append(g('Pista', rect(16, 68, 358, 104, C['surface'], rx=18, stroke='#FFFFFF', sop=0.06),
               lane(30, 84, 330, 'Rafa', None, 0.46, C['accent'], '46%', label_w=100, mobile=True),
               lane(30, 128, 330, 'Marina', None, 0.38, C['rival'], '38%', label_w=100, mobile=True)))
    b.append(metrics(16, 188, big=32, small=20, mobile=True))
    lines, lh = 6, 34
    b.append(bezel(16, 240, 358, lines * lh + 52, 'Palco do texto'))
    tx, _ = typing(42, 266, 306, SAMPLE, 98, errors=(87,), size=20, lh=lh, max_lines=lines)
    b.append(tx)
    b.append(keyboard(W, 844 - 260, 260))
    return svg(W, H, ''.join(b), 'Duel em andamento — Mobile 390')

def sparkline(x, y, w, h, vals, cur_idx):
    n = len(vals); bw = (w - (n - 1) * 6) / n; mx = max(vals)
    items = []
    for i, v in enumerate(vals):
        bh = h * v / mx
        items.append(rect(x + i * (bw + 6), y + h - bh, bw, bh, C['accent'] if i == cur_idx else C['line'], rx=3))
    return g('Últimas partidas (barras)', *items)

def result_desktop():
    W, H = 1440, 900
    b = [header(W, 'Solo')]
    SX, SW = 200, 1040
    b.append(bezel(SX, 112, SW, 380, 'Card resultado'))
    b.append(t(SX + 48, 152, 'Resultado · Médio', 13, C['accent'], 600, ls=0.5))
    b.append(t(SX + 44, 176, '84', 136, C['text'], mono=True, name='mono · wpm grande'))
    b.append(t(SX + 44 + 166, 268, 'wpm', 26, C['muted']))
    b.append(g('Delta', rect(SX + 48, 344, 196, 30, C['ok'], rx=15, fop=0.10, stroke=C['ok'], sop=0.28),
               t(SX + 64, 350, '+6 vs. sua média (78)', 14, C['ok'], 600)))
    gx = SX + 520
    for i, (lab, val) in enumerate([('Precisão', '97,3%'), ('Tempo', '38,4 s'), ('Caracteres', '212'), ('Erros', '6')]):
        x = gx + (i % 2) * 240; y = 160 + (i // 2) * 96
        b.append(t(x, y, lab, 14, C['muted'])); b.append(t(x, y + 24, val, 36, C['text'], mono=True))
    b.append(line(SX + 40, 400.5, SX + SW - 40, 400.5, '#FFFFFF', sop=0.06))
    b.append(t(SX + 48, 420, 'Últimas 10', 13, C['muted']))
    b.append(sparkline(SX + 160, 412, 420, 52, [62, 70, 68, 74, 81, 77, 91, 79, 76, 84], 9))
    b.append(t(SX + SW - 48, 420, 'Recorde: 91 wpm', 13, C['muted'], align='right'))
    pb, pw = button(SX, 520, 'Jogar novamente', 'primary', '↵ Enter', h=52, size=16)
    b.append(pb)
    sb, sw_ = button(SX + pw + 12, 520, 'Novo texto', 'secondary', 'Tab', h=52, size=16)
    b.append(sb)
    gb, _ = button(SX + pw + sw_ + 24, 520, 'Voltar ao início', 'ghost', h=52, size=16)
    b.append(gb)
    b.append(t(SX, 612, 'Suas últimas partidas', 15, C['text'], 600))
    hist = [(84, '97,3%', 'agora'), (76, '95,8%', 'há 12 min'), (79, '96,1%', 'há 40 min'), (91, '98,0%', 'ontem')]
    for i, (v, a, q) in enumerate(hist):
        y = 644 + i * 52
        b.append(g(f'Linha histórico {i + 1}', rect(SX, y, SW, 44, C['surface'], rx=12, fop=1 if i == 0 else 0.6),
                   t(SX + 20, y + 12, str(v), 18, C['accent'] if i == 0 else C['text'], mono=True),
                   rect(SX + 80, y + 19, 560, 6, C['line'], rx=3), rect(SX + 80, y + 19, 560 * v / 91, 6, C['accent'] if i == 0 else C['muted'], rx=3, fop=1 if i == 0 else 0.5),
                   t(SX + 700, y + 13, a, 14, C['muted'], mono=True), t(SX + SW - 20, y + 13, q, 14, C['muted'], align='right')))
    return svg(W, H, ''.join(b), 'Resultado Solo — Desktop 1440')

def result_mobile():
    W, H = 390, 844
    b = [header(W, mobile=True)]
    b.append(bezel(16, 80, 358, 452, 'Card resultado'))
    b.append(t(42, 110, 'Resultado · Médio', 13, C['accent'], 600))
    b.append(t(40, 132, '84', 96, C['text'], mono=True, name='mono · wpm grande'))
    b.append(t(162, 196, 'wpm', 20, C['muted']))
    b.append(g('Delta', rect(42, 250, 176, 28, C['ok'], rx=14, fop=0.10, stroke=C['ok'], sop=0.28),
               t(56, 255, '+6 vs. sua média (78)', 13, C['ok'], 600)))
    for i, (lab, val) in enumerate([('Precisão', '97,3%'), ('Tempo', '38,4 s'), ('Caracteres', '212'), ('Erros', '6')]):
        x = 42 + (i % 2) * 160; y = 300 + (i // 2) * 70
        b.append(t(x, y, lab, 13, C['muted'])); b.append(t(x, y + 20, val, 26, C['text'], mono=True))
    b.append(t(42, 452, 'Últimas 10', 12, C['muted']))
    b.append(sparkline(42, 472, 306, 36, [62, 70, 68, 74, 81, 77, 91, 79, 76, 84], 9))
    pb, _ = button(16, 556, 'Jogar novamente', 'primary', h=52, size=16, width=358)
    b.append(pb.replace('', ''))
    sb, _ = button(16, 620, 'Novo texto', 'secondary', h=48, size=15, width=358)
    b.append(sb)
    gb, _ = button(16, 680, 'Voltar ao início', 'ghost', h=44, size=15, width=358)
    b.append(gb)
    return svg(W, H, ''.join(b), 'Resultado Solo — Mobile 390')

def duel_result_desktop():
    W, H = 1440, 900
    b = [header(W, 'Duelo')]
    SX, SW = 200, 1040
    b.append(bezel(SX, 112, SW, 420, 'Card resultado duelo'))
    b.append(t(SX + 48, 152, 'Resultado final · Sala 482173', 13, C['accent'], 600, ls=0.5))
    b.append(t(SX + 46, 180, 'Você venceu', 56, C['text'], 600, ls=-1.5))
    b.append(t(SX + 48, 250, 'por 13 wpm de diferença', 18, C['muted']))
    rows = [('1', 'Rafa', 'você', 84, '97,3%', '38,4 s', C['accent']), ('2', 'Marina', None, 71, '94,1%', '45,0 s', C['rival'])]
    for i, (pos, nm, tag, wpm, acc, tm, col) in enumerate(rows):
        y = 300 + i * 92
        items = [rect(SX + 40, y, SW - 80, 80, C['surface'] if i else C['surface2'], rx=16, stroke=col if i == 0 else '#FFFFFF', sop=0.3 if i == 0 else 0.05),
                 t(SX + 68, y + 22, f'#{pos}', 28, col, mono=True),
                 avatar(SX + 140, y + 24, nm[0], col, 32), t(SX + 184, y + 22, nm, 18, C['text'], 600)]
        if tag: items.append(t(SX + 184 + tw(nm, 18, 600) + 10, y + 26, tag, 12, C['accent'], 600))
        items.append(t(SX + 184, y + 46, f'{acc} precisão · {tm}', 13, C['muted']))
        items.append(rect(SX + 480, y + 37, 300, 6, C['line'], rx=3))
        items.append(rect(SX + 480, y + 37, 300 * wpm / 84, 6, col, rx=3))
        items.append(t(SX + SW - 68, y + 22, f'{wpm}', 32, C['text'], mono=True, align='right'))
        items.append(t(SX + SW - 68, y + 58, 'wpm', 12, C['muted'], align='right'))
        b.append(g(f'Ranking #{pos} · {nm}', *items))
    pb, pw = button(SX, 560, 'Nova partida', 'primary', '↵ Enter', h=52, size=16)
    b.append(pb)
    gb, _ = button(SX + pw + 12, 560, 'Voltar ao início', 'secondary', 'Esc', h=52, size=16)
    b.append(gb)
    return svg(W, H, ''.join(b), 'Resultado Duelo — Desktop 1440')

def duel_result_mobile():
    W, H = 390, 844
    b = [header(W, mobile=True)]
    b.append(bezel(16, 80, 358, 380, 'Card resultado duelo'))
    b.append(t(42, 110, 'Resultado final', 13, C['accent'], 600))
    b.append(t(41, 132, 'Você venceu', 38, C['text'], 600, ls=-1))
    b.append(t(42, 182, 'por 13 wpm de diferença', 15, C['muted']))
    rows = [('1', 'Rafa', 84, '97,3% · 38,4 s', C['accent']), ('2', 'Marina', 71, '94,1% · 45,0 s', C['rival'])]
    for i, (pos, nm, wpm, sub, col) in enumerate(rows):
        y = 226 + i * 104
        b.append(g(f'Ranking #{pos} · {nm}', rect(32, y, 326, 92, C['surface2'] if i == 0 else C['surface'], rx=14, stroke=col if i == 0 else '#FFFFFF', sop=0.3 if i == 0 else 0.05),
                   t(50, y + 18, f'#{pos}', 22, col, mono=True), t(96, y + 18, nm, 17, C['text'], 600),
                   t(96, y + 42, sub, 12, C['muted']), t(338, y + 16, str(wpm), 26, C['text'], mono=True, align='right'),
                   rect(50, y + 70, 290, 5, C['line'], rx=2.5), rect(50, y + 70, 290 * wpm / 84, 5, col, rx=2.5)))
    pb, _ = button(16, 488, 'Nova partida', 'primary', h=52, size=16, width=358)
    b.append(pb)
    sb, _ = button(16, 552, 'Voltar ao início', 'secondary', h=48, size=15, width=358)
    b.append(sb)
    return svg(W, H, ''.join(b), 'Resultado Duelo — Mobile 390')

def design_system():
    W, H = 1440, 2140
    b = []
    L = 80
    b.append(t(L, 64, 'TypeRace — Design System', 40, C['text'], 600, ls=-1))
    b.append(t(L, 116, 'Direção A · Graphite & Brass · um destaque (latão), oponente em aço como dado. Telas usam Source Sans 3 no lugar de Geist (indisponível no FigCraft).', 15, C['muted']))
    # cores
    b.append(t(L, 180, 'Cores', 22, C['text'], 600))
    toks = [('bg', C['bg'], 'fundo', '—'), ('surface', C['surface'], 'moldura, cards', '—'), ('surface-2', C['surface2'], 'inputs, hover', '—'),
            ('core', C['core'], 'núcleo do palco', '—'), ('line', C['line'], 'hairlines, trilhos', '—'), ('text', C['text'], 'texto, digitado', '15,4:1'),
            ('muted', C['muted'], 'rótulos', '5,9:1'), ('untyped', C['untyped'], 'não digitado', '5,2:1'), ('accent', C['accent'], 'caret, CTA, você', '10,2:1'),
            ('rival', C['rival'], 'oponente', '7,6:1'), ('error', C['error'], 'erro', '6,6:1'), ('ok', C['ok'], 'conectado, ganho', '9,4:1')]
    for i, (nm, hx, use, cr) in enumerate(toks):
        x = L + (i % 6) * 214; y = 220 + (i // 6) * 170
        b.append(g(f'Token · {nm}', rect(x, y, 198, 96, hx, rx=14, stroke='#FFFFFF', sop=0.1),
                   t(x, y + 106, nm, 15, C['text'], 600), t(x, y + 126, hx, 13, C['muted'], mono=True),
                   t(x + 198, y + 126, cr, 13, C['muted'], mono=True, align='right'), t(x, y + 144, use, 13, C['muted'])))
    # tipografia
    y0 = 580
    b.append(t(L, y0, 'Tipografia', 22, C['text'], 600))
    specs = [('Display · 76/80 · 600 · −2', 'Digite rápido.', 56, 600, False),
             ('Título · 34/40 · 600', 'Chame alguém para correr', 34, 600, False),
             ('Corpo · 16/24 · 400', 'Texto aleatório. O tempo começa na primeira tecla.', 16, 400, False),
             ('Rótulo · 13/18 · 600', 'Sala criada', 13, 600, False),
             ('Digitação · JetBrains Mono 28/50 (mobile 20/34)', 'cada erro custa mais tempo', 28, 400, True),
             ('Números · JetBrains Mono tabular', '84  97,3%  0:42', 36, 400, True)]
    y = y0 + 44
    for lab, sample, size, w, mono in specs:
        b.append(t(L, y + max(0, size - 16) / 2 + 4, lab, 13, C['muted'], mono=False))
        b.append(t(L + 380, y, sample, size, C['text'], w, mono=mono))
        y += size + 30
    # espaço e raio
    y0 = 1060
    b.append(t(L, y0, 'Espaço e raio', 22, C['text'], 600))
    x = L
    for s in [4, 8, 12, 16, 24, 32, 48, 64]:
        b.append(g(f'Espaço {s}', rect(x, y0 + 50 + 64 - s, s, s, C['accent'], fop=0.5), t(x, y0 + 124, str(s), 12, C['muted'], mono=True)))
        x += s + 28
    x = L + 520
    for r, lab in [(6, 'kbd 6'), (8, 'chip/avatar 8'), (16, 'núcleo 16'), (22, 'moldura 22'), (22, 'botão pill')]:
        b.append(g(f'Raio {lab}', rect(x, y0 + 50, 88, 64, C['surface2'], rx=r if lab != 'botão pill' else 32, stroke=C['line']), t(x, y0 + 124, lab, 12, C['muted'])))
        x += 120
    # estados do palco
    y0 = 1230
    b.append(t(L, y0, 'Palco de digitação — estados', 22, C['text'], 600))
    b.append(t(L, y0 + 34, 'Digitado = text · não digitado = untyped · erro = error + fundo 14% · espaço errado = sublinhado · caret 2,5 px latão que desliza e só pisca parado.', 13, C['muted']))
    b.append(bezel(L, y0 + 70, 620, 150, 'Palco · focado'))
    tx, _ = typing(L + 36, y0 + 104, 548, 'cada erro custa mais tempo do que uma tecla pressionada', 24, errors=(9, 15), size=24, lh=42, max_lines=2)
    b.append(tx)
    b.append(t(L, y0 + 232, 'Focado, com erro de letra e de espaço', 13, C['muted']))
    b.append(bezel(L + 660, y0 + 70, 620, 150, 'Palco · sem foco'))
    tx, _ = typing(L + 696, y0 + 104, 548, 'cada erro custa mais tempo do que uma tecla pressionada', 24, size=24, lh=42, max_lines=2, all_dim=True)
    b.append(g('Texto desfocado', tx, op=0.2))
    b.append(g('Overlay foco', rect(L + 660 + 150, y0 + 117, 320, 56, C['surface2'], rx=28, stroke=C['line']),
               t(L + 660 + 310, y0 + 136, 'Clique ou tecle para focar', 15, C['text'], 600, align='center')))
    b.append(t(L + 660, y0 + 232, 'Sem foco: texto recua, aviso no centro', 13, C['muted']))
    # componentes (área reservada; componentes reais ficam ao lado do frame)
    y0 = 1520
    b.append(t(L, y0, 'Componentes', 22, C['text'], 600))
    b.append(t(L, y0 + 34, 'Os componentes reais (main components) estão à direita deste frame. Abaixo, a anatomia dos estados.', 13, C['muted']))
    x = L; y = y0 + 76
    for kind, lab, k in [('primary', 'Começar solo', '↵ Enter'), ('secondary', 'Copiar código', None), ('ghost', 'Voltar ao início', None), ('danger', 'Cancelar sala', None)]:
        bt, w = button(x, y, lab, kind, k, h=48); b.append(bt); x += w + 20
    # foco visível
    bt, w = button(x + 6, y, 'Foco visível', 'secondary', h=48)
    b.append(g('Estado foco', rect(x + 2, y - 4, w + 8, 56, 'none', rx=28, stroke=C['accent'], sw=2), bt))
    x += w + 40
    bt, w = button(x, y, 'Desabilitado', 'primary', h=48); b.append(g('Estado desabilitado', bt, op=0.4))
    y += 84; x = L
    for st in ['ok', 'connecting', 'reconnecting', 'offline']:
        bd, w = badge(x, y, st); b.append(bd); x += w + 16
    x += 24
    for lab in ['Tab', 'Enter', 'Esc', '↵ Enter']:
        k, w = kbd(x, y + 3, lab); b.append(k); x += w + 10
    y += 64
    b.append(g('Pista (exemplo)', rect(L, y, 620, 120, C['surface'], rx=20, stroke='#FFFFFF', sop=0.06),
               lane(L + 24, y + 20, 572, 'Rafa', 'você', 0.62, C['accent'], '62%'),
               lane(L + 24, y + 72, 572, 'Marina', 'oponente', 0.41, C['rival'], '41%')))
    b.append(g('Countdown', rect(L + 660, y, 200, 120, C['surface'], rx=20, stroke='#FFFFFF', sop=0.06),
               t(L + 760, y + 20, '3', 72, C['accent'], mono=True, align='center'), t(L + 760, y + 98, 'prepare-se', 12, C['muted'], align='center')))
    b.append(g('Alerta inline', rect(L + 880, y, 400, 56, C['error'], rx=14, fop=0.08, stroke=C['error'], sop=0.3),
               t(L + 900, y + 10, 'Marina saiu da sala.', 14, C['error'], 600), t(L + 900, y + 30, 'Volte ao lobby para criar outra.', 13, C['muted'])))
    b.append(g('Banner reconexão', rect(L + 880, y + 64, 400, 56, C['accent'], rx=14, fop=0.08, stroke=C['accent'], sop=0.3),
               t(L + 900, y + 74, 'Reconectando…', 14, C['accent'], 600), t(L + 900, y + 94, 'Seu progresso continua salvo localmente.', 13, C['muted'])))
    y += 150
    b.append(g('Empty state histórico', rect(L, y, 620, 120, 'none', rx=20, stroke=C['line'], dash='4 4'),
               t(L + 310, y + 34, 'Nenhuma partida ainda', 16, C['text'], 600, align='center'),
               t(L + 310, y + 60, 'Sua primeira corrida aparece aqui, com WPM e precisão.', 13, C['muted'], align='center')))
    sg, _ = segmented(L + 660, y, ['Fácil', 'Médio', 'Difícil'], 'Médio'); b.append(sg)
    b.append(g('Input erro', rect(L + 660, y + 56, 280, 52, C['surface2'], rx=14, stroke=C['error'], sop=0.6),
               t(L + 680, y + 72, '48217', 18, C['text'], mono=True, ls=4), t(L + 660, y + 116, 'O código tem 6 dígitos.', 12, C['error'])))
    b.append(g('Motion', t(L + 980, y, 'Motion', 15, C['text'], 600),
               t(L + 980, y + 26, 'ease: cubic-bezier(.32,.72,0,1)', 13, C['muted'], mono=True),
               t(L + 980, y + 48, 'caret 120 ms · resultado 240 ms', 13, C['muted']),
               t(L + 980, y + 70, 'countdown 300 ms (scale+fade)', 13, C['muted']),
               t(L + 980, y + 92, 'reduced-motion: tudo instantâneo', 13, C['muted'])))
    return svg(W, H, ''.join(b), 'Design System')

SCREENS = {
    'ds': design_system,
    'home-desktop': home_desktop, 'home-mobile': home_mobile,
    'solo-desktop': solo_desktop, 'solo-mobile': solo_mobile,
    'waiting-desktop': waiting_desktop, 'waiting-mobile': waiting_mobile,
    'duel-desktop': duel_desktop, 'duel-mobile': duel_mobile,
    'result-desktop': result_desktop, 'result-mobile': result_mobile,
    'duel-result-desktop': duel_result_desktop, 'duel-result-mobile': duel_result_mobile,
}
# componentes isolados (viram main components)
def comp(name, w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" id="{escape(name)}">{body}</svg>'

def components():
    out = {}
    for kind, lab, k in [('primary', 'Começar solo', '↵ Enter'), ('secondary', 'Copiar código', None), ('ghost', 'Voltar ao início', None)]:
        bt, w = button(0, 0, lab, kind, k, h=48)
        out[f'c-btn-{kind}'] = comp(f'Button/{kind.capitalize()}', w, 48, bt)
    for st in ['ok', 'connecting', 'reconnecting', 'offline']:
        bd, w = badge(0, 0, st)
        out[f'c-badge-{st}'] = comp(f'ConnectionBadge/{st}', w, 28, bd)
    k, w = kbd(0, 0, 'Enter'); out['c-kbd'] = comp('Kbd', w, 22, k)
    out['c-lane-you'] = comp('Lane/Você', 572, 34, lane(0, 2, 572, 'Rafa', 'você', 0.62, C['accent'], '62%'))
    out['c-lane-rival'] = comp('Lane/Oponente', 572, 34, lane(0, 2, 572, 'Marina', 'oponente', 0.41, C['rival'], '41%'))
    out['c-metrics'] = comp('Metrics', 520, 48, metrics(0, 0))
    return out

if __name__ == '__main__':
    for k, fn in SCREENS.items():
        open(os.path.join(OUT, f'{k}.svg'), 'w').write(fn())
    for k, s in components().items():
        open(os.path.join(OUT, f'{k}.svg'), 'w').write(s)
    print('ok', len(os.listdir(OUT)))
