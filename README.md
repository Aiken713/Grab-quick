# Rarity Picker

A party-game picker. Add items, give each a chance, press Start, wait, and it reveals one with a rarity and a sound. No build step and no dependencies.

## Run it in VS Code
1. File > Open Folder and choose this folder.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

(You can also just double-click `index.html`.)

## Files
- `index.html` - page layout
- `style.css` - colors and layout
- `script.js` - picking, sounds, stats, TV mode, settings, saving

Settings save in your browser (localStorage), per device.

## Push to GitHub
```
git init
git add .
git commit -m "Rarity Picker"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/rarity-picker.git
git push -u origin main
```

## Host it free with GitHub Pages
In the repo: Settings > Pages > Deploy from a branch > `main` / root. Your friends can then open the link on their phones.

## TV mode
Press **TV mode** to go full screen with just the big reveal. On a computer you can press Space to start the next round. Press Esc (or the faint button in the corner) to leave.

## Recording sounds
The mic only works on `localhost` (Live Server) or an `https` link like GitHub Pages. If you open `index.html` by double-clicking, use Upload a file instead.

## Wheels
**My wheels** keeps a library. Each wheel has its own items, rarities, sounds, stats and log. Create, rename, duplicate, open or delete them. Export all wheels to one file for backup or to share.

## Rarities
Each wheel starts with Common, Uncommon, Rare, Epic, Legendary, Mythic and Crazy pull. Rename them, change their colors, delete them, or add your own under **Rarity names and sounds**. Each rarity can have its own recorded or uploaded sound.

## Chances
Each item is either **Auto** or has its own number. Items with a number keep exactly that chance. Whatever is left out of 100% is shared evenly by the Auto items. The colored bar above the list shows everyone's real chance.

## Sharing one wheel
In **My wheels**, each wheel has two buttons:
- **Export** downloads just that wheel as a file. Others can load it with **Import file**.
- **Copy link** copies a link that carries the wheel inside it. Anyone who opens the link gets their own copy added to their list. If a link ever gets mangled by a chat app, they can paste it into **Paste a shared link here** in My wheels. This only works once the page is hosted (for example GitHub Pages), not from a file on your computer. Recorded or uploaded sounds are not included in links, so use Export for those.
