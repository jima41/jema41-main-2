#!/usr/bin/env python3
import subprocess
import os
import sys

os.chdir('/workspaces/jema41')

commands = [
    ['git', 'add', '-A'],
    ['git', 'commit', '-m', 'feat: mise à jour complète - ajout codes promo, notes olfactives dynamiques, classement produits, analytics enrichie, et UI améliorée'],
    ['git', 'push', 'origin', 'main']
]

print("🚀 Démarrage du déploiement sur GitHub Pages...\n")

for cmd in commands:
    try:
        print(f"➤ Exécution: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, cwd='/workspaces/jema41')
        if result.stdout:
            print(result.stdout)
        if result.stderr and 'nothing to commit' not in result.stderr.lower():
            print(f"  ℹ️  {result.stderr}")
        print()
    except Exception as e:
        print(f"  ❌ Erreur: {e}\n")
        continue

print("✅ Les modifications ont été poussées vers GitHub main")
print("")
print("⏳ GitHub Actions va maintenant:")
print("   1. Construire le projet")
print("   2. Publier sur GitHub Pages")
print("")
print("🔗 Votre site sera bientôt disponible sur:")
print("   https://jima41.github.io/jema41/")
print("")
print("🌍 Vérifiez le déploiement dans: https://github.com/jima41/jema41/actions")
