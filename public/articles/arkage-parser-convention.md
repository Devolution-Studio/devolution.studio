# Arkage Parser Convention

Normes et bonnes pratiques pour l'analyse syntaxique et l’interprétation des lignes de commande.

# TL; DR

Un résumé de cette convention est disponible sur le lien suivant :

# Introduction

Ce document vise à établir un cadre rigoureux pour la conception et l'interprétation des interfaces en ligne de commande (CLI). En définissant un ensemble de règles strictes concernant la syntaxe, les types de données et les structures de commandes, cette convention a pour objectifs :

-   **Améliorer la lisibilité et la cohérence** des interfaces CLI, facilitant ainsi leur utilisation par les utilisateurs.
-   **Réduire les erreurs d'interprétation** et les ambiguïtés, garantissant un traitement fiable des commandes.
-   **Favoriser l'interopérabilité** entre les différents outils CLI en adoptant des conventions communes.
-   **Servir de référence** pour les développeurs souhaitant créer de nouveaux outils CLI.

Cette convention abordera en détail les éléments constitutifs d'une ligne de commande et comment en faire une bonne analyse syntaxique. Elle définira également les types de données supportés et les mécanismes d'interprétation. Des exemples pratiques ainsi que des schémas illustreront l'application de ces règles dans des scénarios concrets.

Cette convention peut se révéler particulièrement utile pour les développeurs qui souhaite créer leur propre outil CLI.

# Les bases de l’interprétation

![global.jpg](https://devolution.studio/img/blog/arkage/global.jpg)

Transformer une chaîne de caractères en une action précise : tel est le défi de l'interprétation des lignes de commande. Derrière la simplicité apparente d'une commande se cachent des mécanismes complexes d'analyse syntaxique et soulève de nombreuses questions :

-   Comment associer les bons arguments aux options / commandes ?
-   Comment vérifier la validité des données fournies par l'utilisateur ?
-   Comment gérer les erreurs ?

Ce chapitre aborde les différentes techniques d'interprétation, les pièges à éviter et les bonnes pratiques à adopter pour créer des outils CLI fiables et robustes.

## Convention de nommage

Dans cette convention technique, nous adopterons la **convention de nommage `kebab-case`** pour les options, les commandes ou les sous-commandes. Ceci est pour assurer une cohérence et une lisibilité maximales dans la définition de nos commandes et options.

Le kebab-case consiste à écrire les mots en minuscules, séparés par des tirets (-). Par exemple : `create-user`, `list-files`, `set-config`.

Ce choix est motivé par sa **lisibilité** accrue grâce à la séparation claire des mots et par sa **compatibilité** avec la syntaxe des options longues en ligne de commande (par exemple, `--create-user`). Cette convention est également **largement adoptée** dans de nombreux domaines du développement web, ce qui la rend familière à la plupart des développeurs.

## Les types

De nombreux outils CLI utilisent l'auto-complétion pour suggérer des options et des valeurs possibles. Le typage des arguments est crucial pour fournir des suggestions pertinentes et réduire les erreurs de saisie.

Les types de base sont bien entendu les `string` les `number` et les `bool` mais il est parfois intéressant d’aller un peu plus loin dans les types attendu afin de proposer une meilleur expérience. Voici une liste non-exhaustive de types intéressant à traiter :

| Nom                 | type       | Description                                                                                                                       |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Chaîne de caractère | `string`   | Attention, le caractère `"` est réservé pour contenir le `string`, possibilité de faire `"\""` pour échapper le caractère         |
| Caractères          | `char`     | N’importe quel caractère unique, `'` est réservé pour contenir le `char` , possibilité de faire `'\''` pour échapper le caractère |
| Booléen             | `bool`     | Capable de parser un `TrUe` en `true` par exemple                                                                                 |
| Fichier             | `file`     | Peut vérifier l’existence du fichier et son extension au lancement de la commande (optionnel)                                     |
| Dossier             | `folder`   | Peut vérifier l’existence du dossier au lancement de la commande (optionnel)                                                      |
| Nombre              | `number`   | Type `double`, peuvent être signés                                                                                                |
| Url                 | `url`      | Capable de reconnaitre le format d’un `url`                                                                                       |
| Enumération         | `enum`     | Une liste précise de valeurs possibles                                                                                            |
| Tableau             | `Array<T>` | Cas particulier, ne peut être utilisé que pour les arguments de commandes en dernier argument                                     |

## Commande

Le premier mot d'une commande désigne le programme à exécuter. Ce programme, souvent appelé **exécutable** ou **binaire**, est un fichier contenant les instructions à exécuter. Le système d'exploitation recherche les exécutables dans des répertoires spécifiques, définis dans votre configuration (par exemple, dans le fichier `.bashrc`). La commande est le point d’entré de votre programme.

```bash
~ which git
/usr/bin/git
```

## Sous-commande

**Les sous-commandes sont des commandes spécifiques à un programme principal.** Elles permettent d'organiser les fonctionnalités d'un programme en modules plus fins.

Par exemple, `git` utilise des sous-commandes pour effectuer des opérations comme `checkout`, `merge` ou `commit`. Ces sous-commandes sont en fait des commandes à part entière qui sont exécutées dans le contexte de la commande `git`.

**Remarque:** Tous les programmes n'utilisent pas de sous-commandes. Certains programmes exécutent une seule tâche et prennent directement leurs arguments.

```bash
# Par exemple, git a des sous-commandes :
git checkout
git merge
git commit

# Mais la commande ping n'en a pas, il prend directement un argument
ping www.google.com
```

### Surcharge d’arguments

Les sous-commandes ont cette particularité, comme en Java, de pouvoir proposer plusieurs possibilités et combinaisons d’arguments possible pour une seule sous-commande. On parle alors de **plusieurs signatures** pour une sous-commande.

Les règles sont similaire à celles en Java : les signatures sont déclarées pour une seule et même sous-commande, et les signatures doivent avoir un nombre d’arguments différents ou avoir des types différents. Nous verrons un cas pratique plus bas dans ce document.

## Les options

### Qu'est-ce qu'une option ?

Une option est un argument spécial qui vient modifier le comportement d'une commande. Elle est précédée de deux tirets (`--`) pour la distinguer des autres arguments.Son rôle est de fournir des informations supplémentaires à la commande pour qu'elle s'exécute de manière spécifique.

Une options nécessitent systématiquement une **valeur typée** pour fonctionner. Par exemple :

```bash
--output ./mon_fichier.txt
# Ici, `--output` est l'option et `./mon_fichier.txt` est
# la valeur qui indique où enregistrer la sortie
--output 4
# L'option attendait un chemin de fichier, un nombre ne fais pas sens ici
```

### Les options globales

Certaines options sont définies au niveau du programme principal et sont donc **disponibles pour toutes les sous-commandes**. On les appelle des **options globales**. D'autres options sont spécifiques à une sous-commande particulière et sont donc appelées **options locales**.

Par exemple, l’option `--verbose` pourrait être **globale** et disponible dans tout le programme, tandis que l’option `--output` serait spécifique à la sous-commande exécutée

### Options booléennes : un cas particulier

Bien qu’une option requière une valeur pour fonctionner, il existe un cas où il n’est pas nécessaire de spécifier une valeur.

Ce cas est quand une option attend une valeur de type booléen :

-   **Valeur par défaut:** Par défaut, une option booléenne est considérée comme étant `false`. Si vous ne la spécifiez pas, la valeur par défaut sera considérée.
-   **Activation:** Pour activer une option booléenne, il suffit de l'inclure dans la commande et sa valeur passera à `true`.

### Désactiver explicitement une option booléenne

Dans certains cas, vous pourriez vouloir indiquer explicitement que vous souhaitez désactiver une option booléenne, pour plus de compréhension pour l’utilisateur. Pour cela, de nombreuses commandes proposent une syntaxe spécifique, souvent en ajoutant le préfixe `no-` avant le nom de l'option :

```bash
--verbose # L'option verbose sera égal à true
--no-logs # L'option no-logs sera égal à true
--logs false # Impossible d'attribuer un argument à une option de type bool
```

### Rappel de convention de nommage

Comme expliqué au début de ce document, afin d'améliorer la clarté et la maintenabilité des scripts, il est recommandé d'utiliser la notation **kebab-case** pour nommer les options. Cette convention consiste à séparer les mots par des tirets, en utilisant uniquement des minuscules.

Exemple :

```bash
--output-file --set-credentials --no-logs
--outputFile # Mauvais format
```

**Règles à retenir :**

-   **Unicité:** Chaque option doit avoir un nom unique au sein d'une commande.
-   **Type de données:** Les options peuvent avoir différents types de données (chaîne de caractères, nombre, booléen...).
-   **Valeur par défaut:** Les options booléennes ont une valeur par défaut (`false`).
-   **Kebab-case:** Les options doivent utiliser la convention kebab-case

## Les flags

Pour simplifier la saisie des commandes, de nombreuses commandes proposent des **options courtes**, souvent appelées **flags**. Un flag est généralement représenté par un seul caractère précédé d'un tiret simple (`-`).

Les flags ont la particularité de pouvoir **s’accumuler**. Il est fréquent de pouvoir combiner plusieurs flags en un seul argument. Par exemple, `ls -al` équivaut à `ls -a -l`.

Les flags sont souvent des raccourcis pour des options longues, qui sont généralement plus explicites.

**Règles à retenir :**

-   **Unicité:** Chaque flag doit être unique au sein d'une commande.
-   **Optionnel:** Chaque option ne requière pas forcément un flag, il s’agit juste d’un “raccourci”
-   **Explicite:** Un flag doit porter une lettre explicite de l’option à laquelle il est rattaché, par exemple `-o` pour `--output`

## Les arguments

![assignments.jpg](https://devolution.studio/img/blog/arkage/assignments.jpg)

Les arguments sont des données fournies à une commande ou à une sous-commande afin de spécifier les éléments sur lesquels elle doit opérer. Ils sont étroitement liés aux options et aux flags, mais **se distinguent par leur type et leur position** dans la ligne de commande.

Pour assurer la cohérence et la robustesse d'une commande, chaque argument doit correspondre à un type de données référencé. Ce typage permet de valider les entrées utilisateur et d'éviter les erreurs d'exécution. Dans le cas échéant, cela permettra de retourner des erreurs détaillées.

### Tableau d’arguments

Certaines commandes peuvent accepter un nombre variable d'arguments. Pour représenter ce concept, le type `Array<T>` est couramment utilisé. Un argument de type tableau peut contenir zéro, un ou plusieurs éléments du type `T`.

En raison de leur nature variable, les arguments de type tableau **doivent être placés en dernière position** dans la liste des arguments d'une commande. Cette convention permet l'analyse de la ligne de commande et permet d'interpréter correctement les valeurs fournies par l'utilisateur.

Voici un exemple :

```bash
# Les arguments acceptés sont number, Array<string>
arkage ping 4 us uk eu-west eu-est
```

Ce processus est très proche des `variadic` en PHP, cependant il n’est possible d’avoir un type `Array<T>` uniquement **pour les arguments de commandes / sous-commande**. Ce type n’est pas utilisable pour une option pour des raisons de lisibilité.

# Exemples et cas pratique

## Déclaration complète d’une commande

### Les options globales

Pour notre cas pratique, considérons une commande fictive que nous nommerons `arkage`. Dans un premier temps nous pouvons déclarer nos options globales de notre commande :

| Option      | Flag | Type     | Défaut | Description              |
| ----------- | ---- | -------- | ------ | ------------------------ |
| `--verbose` | `-v` | Booléen  | `true` | Active le mode verbose   |
| `--lang`    | `-l` | `string` | `en`   | Change la lange          |
| `--en`      |      | Booléen  | `true` | Change la langue en `en` |
| `--fr`      |      | Booléen  | `true` | Change la langue en `fr` |

Par déduction, on comprend qu’il serait redondant de mettre les deux options `--en` et `--fr` dans la même ligne de commande. Cependant, d’un point de vue syntaxique, **rien ne nous l’interdit**. Ça sera au programme de décider quel langage choisir ou s’il souhaite lever une erreur.

```bash
arkage help --fr --en # Syntaxe valide
```

### Les sous-commandes

Une fois les options globales déclarées, nous avons besoin de sous-commandes pour avoir de la matière à exécuter. Pour déclarer une sous-commande, il est important de déclarer son nom (toujours en `kebab-case`), ses options et ses arguments possible

| Sous-commande | Options         | Flag | Type     | Arguments sous-commande          |
| ------------- | --------------- | ---- | -------- | -------------------------------- |
| `help`        |                 |      |          | Aucuns arguments                 |
| `ping`        |                 |      |          | `int`, `Array<string>`           |
| `register`    | `--credentials` | `-c` | Booléen  | `string`, `string` ou `filepath` |
|               | `--key`         | `-k` | Booléen  |                                  |
|               | `--server`      | `-s` | `string` |                                  |

Les sous-commandes disponibles sont :

-   `help`
-   `ping`
-   `register`
-   `start`
-   `exit`

La commande `help` ne prend aucuns arguments mais peut prendre l’option suivantes :

-   `--lang` ou `-l` avec un argument string derrière
-   `--fr` et est de type booléen
-   `--en` et est de type booléen

Pour la sous-commande `ping`, celle ci ne prend pas d’options mais peut prendre une infinité de `string`

```bash
arkage ping 4 us uk eu-west eu-est
```

Le 1er argument spécifie le nombre de tentatives, le reste les serveurs à atteindre

Les arguments sont reconverti dans un tableau pour le traitement de l’information

Voici donc la déclaration des arguments pour cette sous-commande :

-   Tentatives `int`
-   Serveurs `Array<string>`

Un `Array` doit toujours être le dernier argument car il peut contenir une infinité de valeurs

### Options globales

```bash
arkage register -c teo@arkage.com 1234aze*
arkage register -k ./id_rsa
arkage register -s eu-west -k ./id_rsa -v --lang en
# Erreur, mais côté traitement de la commande car -c et -k sont incompatible

```

# Déclaration d’une commande

## Déclaration des sous-commandes

Liste des sous-commandes disponibles

Comporte la liste et les types d’arguments possible

Comporte les options possible pour la sous-commande

## Déclaration des arguments

Pour interpréter une commande, le mieux est de savoir en avance ce que l’on attend

Pour la commande suivante :

```bash
tail -f -50 logs.txt
# Fonctionne aussi
tail -f logs.txt
# Ne fonctionne pas
tail -f logs.txt -50
```

Le flag `-f` pour “follow”

`-50` n’est pas un flag mais un argument de type `signed int`

La commande attend les arguments suivants : `signed int`, `filepath (string)`

Ou sinon uniquement `filepath (string)`

Mais pas `filepath (string)`, `signed int`

## Options globales

Des options peuvent être commune dans n’importe quel contexte, comme `-v` par exemple

## Options de sous-commandes

Des options et des flags ne peuvent être disponible qu’à propos d’une sous-commande

# Intégration Typescript

# Sources

[https://www.php.net/manual/fr/functions.arguments.php#functions.variable-arg-list](https://www.php.net/manual/fr/functions.arguments.php#functions.variable-arg-list)
