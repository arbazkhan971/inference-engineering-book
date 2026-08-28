# Inference Engineering — Le guide en mots simples

*Tout le contenu du livre « Inference Engineering: Inside the Engine Room of AI
Agents », expliqué de façon que n'importe qui puisse suivre — sans code, sans
maths, sans jargon. Si vous arrivez à suivre ce qui se passe dans la cuisine
d'un restaurant, vous arriverez à suivre ce guide.*

---

## Commencez ici : l'idée unique sur laquelle tout repose

Quand vous écrivez à une IA et que des mots vous reviennent, trois choses
différentes travaillent pour vous — pas une seule.

1. **Le cerveau** — le modèle d'IA lui-même. Un gigantesque tas de savoirs
   appris. Il vit dans le bâtiment d'une entreprise et ne bouge jamais.
2. **La cuisine** — tout ce qui se trouve entre vous et le cerveau : le
   bâtiment, les puces informatiques ultra-rapides, le personnel, les files
   d'attente, les prix affichés au mur. Les ingénieurs appellent cela
   « l'inférence ». Ce livre parle de cette partie.
3. **Vous, le client malin** — votre façon de demander, ce que vous envoyez,
   quand vous l'envoyez, et ce que vous faites pendant l'attente. Les
   ingénieurs appellent cela « le harnais » (*harness*).

Voici la phrase-choc que tout le livre défend : **quand l'IA semble lente,
bête ou coûteuse, c'est presque toujours la faute de la cuisine — pas du
cerveau.** Un cerveau brillant dans une cuisine débordée vous sert mal, et
aucune dose de cerveau n'y change rien.

Ce guide vous fait donc visiter la cuisine, une idée à la fois, avec la
méthode d'un physicien célèbre (Richard Feynman) : si on ne peut pas
expliquer simplement, c'est qu'on n'a pas compris. Chaque idée ci-dessous
reçoit quatre choses — une phrase simple, une image du quotidien, ce qui se
passe vraiment, et pourquoi cela compte pour vous.

Lisez les quatre parties dans l'ordre. Chacune demande une dizaine de
minutes. Une poignée de main sur les noms avant d'entrer : le livre
appelle cela la salle des machines ; ce guide l'appelle une cuisine —
même machine, porte plus accueillante.

---

# Partie I — Sous le prompt : trois ouvriers, des morceaux de mots et le prix de l'attente

La première partie du livre répond à une question que vous ne vous êtes
sans doute jamais posée : quand j'écris à une IA et que des mots me
reviennent, *qui fait le travail ?* La réponse est « trois choses
différentes », et savoir laquelle est en difficulté fait la différence entre
réparer un problème et payer la mauvaise réparation. Nous découvrirons
ensuite les étranges unités dans lesquelles tout ce commerce est facturé,
pourquoi les réponses ne peuvent arriver qu'un pas à la fois, et le carnet
caché qui rend les longues conversations coûteuses.

## 1. Trois ouvriers se tiennent derrière chaque réponse

> **En une phrase :** Chaque réponse que vous recevez est produite par trois ouvriers différents — un cerveau qui sait, une cuisine qui vous le sert, et un serveur qui porte votre commande — et la plupart des moments « l'IA est lente aujourd'hui » sont en réalité des moments de cuisine.
>
> **L'image du quotidien :** Un restaurant. Le chef est brillant — c'est le cerveau. La cuisine autour du chef — fours, personnel, le porte-recevets — c'est tout ce que l'entreprise d'IA a construit pour servir des milliers de personnes à la fois. Le serveur, c'est vous et votre manière de demander : ce qui s'écrit sur le recevets, quand il part en cuisine, ce qui se passe quand un plat revient faux. Si le mauvais plat arrive, c'est le chef. Si le bon plat arrive froid et en retard parce que la cuisine est débordée, c'est la cuisine. Si le plat n'arrive jamais parce que le recevets s'est envolé du porte-recevets, c'est le serveur.
>
> **Ce qui se passe vraiment :** Quand vous envoyez un message, il voyage jusqu'au bâtiment de l'entreprise d'IA, est vérifié contre vos quotas, attend dans une file, et est lu d'un seul bloc — et c'est seulement alors que commence l'écriture de la réponse, petit morceau par petit morceau. Le seul travail du cerveau, c'est de savoir. Tout ce qui se trouve entre votre appui sur « envoyer » et le premier morceau de la réponse — la vérification, l'attente, la lecture — est du travail de cuisine : des machines que l'entreprise a construites et fait tourner. Et voici le retournement que la plupart des gens ratent : un serveur peut bloquer une cuisine (mal demander, demander trop souvent), mais une cuisine ne peut jamais faire oublier une recette à un chef. La faute ne circule que dans un sens.
>
> **Pourquoi cela compte pour vous :** Avant de vous plaindre, étiquetez la panne. Réponse fausse ou absurde — cerveau. Bonne réponse, mais tardive ou interrompue — cuisine. Requête jamais correctement envoyée, ou envoyée cinq fois dans la panique — serveur. Dans ce commerce, la plupart de l'argent gaspillé vient du changement de cerveau alors que le problème était la cuisine.

## 2. Les morceaux de mots : la monnaie privée de chaque entreprise d'IA

> **En une phrase :** Les entreprises d'IA ne comptent ni vos mots ni vos lettres — elles comptent des « morceaux de mots », des fragments de texte de leur invention, et chaque entreprise découpe le texte à sa façon.
>
> **L'image du quotidien :** Voyager à l'étranger avec uniquement des dollars en poche. Le pays où vous atterrissez affiche tout dans sa propre monnaie — le menu, la pompe à essence, le compteur du taxi — et chaque pays a son propre taux de change. Votre facture est toujours calculée dans *leur* monnaie, jamais dans la vôtre, et le taux change silencieusement chaque fois que vous franchissez une frontière.
>
> **Ce qui se passe vraiment :** Avant que le cerveau ne lise quoi que ce soit, une machine à découper fragmente votre texte en morceaux issus d'un catalogue figé, préparé à l'avance par l'entreprise. Les mots courants deviennent en général un seul morceau ; les mots plus rares ou plus longs se retrouvent coupés en plusieurs ; les autres langues et les longues suites de chiffres coûtent souvent bien plus de morceaux que l'anglais simple. Tout ce qui vous est un jour facturé — la taille de ce que vous envoyez, la taille de la réponse, vos limites de vitesse, vos quotas — se mesure en ces morceaux, dans la monnaie propre de l'entreprise.
>
> **Pourquoi cela compte pour vous :** On vous facture des morceaux, pas des mots. La même phrase peut coûter des montants nettement différents selon les entreprises, et même au sein d'une même entreprise quand elle met à jour son modèle — le style de découpe change et votre facture change avec, à mots identiques. Si un outil vous dit « cela coûte environ soixante-quinze mots », prenez-le comme une estimation à la louche, pas comme une facture.

## 3. Pourquoi les réponses n'arrivent qu'un morceau à la fois

> **En une phrase :** Chaque nouveau morceau de mot est choisi en regardant tout ce qui est déjà écrit, donc la réponse d'une IA est une chaîne — aucun maillon ne peut être forgé avant que celui qui le précède n'existe.
>
> **L'image du quotidien :** La barre de suggestions du clavier de votre téléphone. Elle ne propose le mot suivant qu'après avoir vu tout ce que vous avez tapé jusqu'ici — impossible de lui demander le quatrième mot sans accepter les trois premiers. Une IA qui écrit une réponse, c'est cette machine à suggestions avec la touche « accepter » maintenue enfoncée, à la vitesse d'une machine.
>
> **Ce qui se passe vraiment :** Lire votre question est rapide, parce que tout ce que vous avez envoyé est déjà là et peut être pris d'un seul bloc. Écrire est différent : la machine produit un morceau, puis s'en sert (avec tout ce qui précède) pour choisir le suivant, puis le suivant — un relais où le même coureur doit courir chaque étape, dans l'ordre. Le temps total de chaque réponse a donc une forme têtue : une attente avant le premier morceau, puis un rythme régulier d'un pas par morceau jusqu'à la fin. Aucune puissance brute ne permet à la machine de sauter en avant, parce que les morceaux vers lesquels sauter n'existent pas encore.
>
> **Pourquoi cela compte pour vous :** Les deux moitiés de l'attente ont des propriétaires et des remèdes différents. Les réponses courtes vivent ou meurent selon la rapidité d'arrivée du premier morceau. Les réponses longues vivent ou meurent selon le rythme entre les morceaux. Si une application paraît réactive mais « tape » lentement, c'est un problème de rythme ; si elle reste muette avant de dire quoi que ce soit, c'est un problème de premier morceau — et aucune mise à niveau de vitesse de frappe ne répare une attente de premier morceau.

## 4. Deux raisons différentes d'attendre : réfléchir fort ou aller chercher

> **En une phrase :** Certains travaux d'ordinateur sont lents parce que la réflexion est énorme, d'autres parce que les allers-retours ne s'arrêtent jamais — et écrire une réponse d'IA est surtout un problème d'allers-retours.
>
> **L'image du quotidien :** Une cuisine avec vingt chefs, dix feux et tous les gadgets possibles — et derrière, un seul escalier étroit qui descend à la réserve. Une commande exigeant deux cents oignons émincés est limitée par les chefs. Un service qui envoie un œuf à la fois laisse dix-neuf chefs au pied de l'escalier, à attendre l'œuf suivant. Embaucher plus de chefs ne répare que le premier genre de lenteur.
>
> **Ce qui se passe vraiment :** Pour produire chaque petit morceau de mot, la machine doit aller chercher pour ainsi dire le cerveau entier — tout son savoir appris — à travers une porte qui va de la mémoire vers l'endroit où la réflexion se produit. C'est la vitesse de la porte, pas la puissance de réflexion, qui fixe le rythme de votre réponse. Voilà pourquoi la puce sophistiquée à l'intérieur est presque oisive pendant que vous regardez les mots apparaître : elle fait un soupçon de calcul sur chaque morceau de savoir puis attend le lot suivant. Voilà aussi pourquoi donner dix puces sophistiquées à la cuisine n'accélère pas *votre réponse à vous* — dix puces, ce sont dix cuisines, qui servent dix autres personnes, pendant que votre réponse continue de descendre un seul escalier.
>
> **Pourquoi cela compte pour vous :** Quand quelqu'un promet de rendre une IA « plus rapide avec plus de puissance de calcul », demandez de quelle lenteur il parle. Les vraies astuces de vitesse vivent dans l'agencement de la cuisine — regrouper les commandes de plusieurs personnes sur un seul aller-retour, ou réduire ce qu'il faut aller chercher. Plus de chefs n'élargissent pas un escalier.

## 5. La copie vivante que la cuisine garde de votre commande

> **En une phrase :** Pour chaque conversation, la cuisine tient un jeu de notes à jour sur tout ce qui a été lu et écrit jusqu'ici — séparé du cerveau — et ces notes grossissent à chaque morceau.
>
> **L'image du quotidien :** Une sténotypiste dans une réunion qui dure toute la journée. Elle pourrait relire tout le compte rendu chaque fois que quelqu'un prend la parole, mais elle garde plutôt une courte fiche sur chaque personne posée sur son bureau — « a posé la question du budget, veut des chiffres » — et jette un œil aux fiches, pas au compte rendu. Les fiches sont sa mémoire de travail. C'est le bureau qui finit par manquer de place.
>
> **Ce qui se passe vraiment :** À mesure que votre conversation grandit, la machine écrit une petite note pour chaque morceau de mot — ce que ce morceau signifie pour tout ce qui vient après. Ces notes sont la raison pour laquelle chaque nouveau morceau peut s'écrire sans refaire tout le travail passé ; sans elles, chaque mot suivant deviendrait plus lent au fur et à mesure que vous parlez. Les notes vivent dans la mémoire la plus rapide et la plus chère du bâtiment, parce qu'elles sont consultées pour chaque morceau produit.
>
> **Pourquoi cela compte pour vous :** Sur une longue conversation, ces notes peuvent devenir aussi grosses que le cerveau lui-même — et elles sont conservées *par conversation*, donc une cuisine chargée jongle avec un carnet qui grossit par client. Quand une entreprise plafonne ce que vous pouvez envoyer, c'est en général ce carnet — pas le cerveau — qui en est la raison — et cela prépare la dernière idée de cette partie.

## 6. Les longues conversations coûtent plus cher : le plan des tables

> **En une phrase :** La promesse d'une entreprise « cette IA gère d'énormes conversations » est une promesse de mètres carrés, pas de puissance mentale — chaque longue conversation occupe une grande table, et il n'y en a qu'un nombre limité.
>
> **L'image du quotidien :** Une salle dont l'enseigne annonce « deux cents couverts ». Le chef est un seul homme — le même chef pourrait cuisiner dans un bistro de quarante couverts. « Deux cents couverts » a été décidé par la surface au sol, les règles de sécurité incendie et le nombre de tables : l'arithmétique du propriétaire, pas les recettes. L'enseigne vend la salle, mais c'est le bâtiment qui a fixé le chiffre.
>
> **Ce qui se passe vraiment :** Chaque conversation occupe une tranche de la précieuse mémoire de la cuisine, et cette tranche grandit régulièrement à mesure que la discussion s'allonge. La même cuisine qui héberge confortablement une douzaine de conversations moyennes n'en gérera peut-être que quelques-unes très longues — même cuisine, même cerveau, même loyer. Les entreprises traitent donc la capacité « grande conversation » comme un produit premium : prix plus élevés, paliers spéciaux, plafonds stricts sur ce que vous pouvez envoyer d'un coup. C'est une décision de placement vendue comme un talent.
>
> **Pourquoi cela compte pour vous :** Si vous comptez sur de très longues discussions, attendez-vous à payer la place, et attendez-vous aussi à des bizarreries de qualité — les cerveaux peinent réellement à exploiter uniformément le milieu d'un énorme tas de notes, donc une IA peut « oublier » quelque chose dit plus tôt non pas parce que la note a disparu, mais parce que le tas est devenu difficile à fouiller. Élaguer une conversation, ou en recommencer une neuve, n'est pas qu'une question de rangement — cela libère une vraie table dans une vraie cuisine.

---

*C'est toute la Partie I en mots simples : trois ouvriers et celui des trois qu'il faut blâmer, une monnaie privée appelée morceaux de mots, des réponses qui ne peuvent se construire qu'un morceau à la fois, une vitesse limitée par les allers-retours, et le carnet qui grossit et rend les longues conversations premium. La Partie II entre dans la cuisine elle-même — regrouper les commandes, partager les notes, et les astuces qui rendent possible le service de milliers de couverts à la fois.*
# Partie II — Dans le moteur, en mots simples

Le cerveau de l'IA n'est qu'une partie de ce qui vous répond. Autour de lui, une cuisine : files d'attente, carnets, cuisiniers, feux, prix. Six idées prises dans cette cuisine, chacune expliquée à la manière de Feynman — une phrase, une image du quotidien, ce qui se passe vraiment, et pourquoi cela compte pour vous.

## 1. Vous partagez la cuisine avec des inconnus

> **En une phrase :** L'entreprise qui fait tourner l'IA pour vous cuisine les commandes de beaucoup de monde en même temps dans une seule grande cuisine, et la vitesse à laquelle votre plat arrive dépend de l'activité des commandes des autres, pas seulement de la vôtre.

> **L'image du quotidien :** Un bus de ville. Il ne termine jamais une course, n'attend jamais qu'un passager ait fini toutes ses courses. À chaque arrêt, ceux qui ont terminé descendent et ceux qui attendent montent. Votre trajet est fluide parce que personne ne prend le bus en otage. L'ancien bus charter fonctionnait à l'inverse : il attendait que le client le plus lent à bord revienne enfin du centre commercial — et tous les autres restaient assis, otages.

> **Ce qui se passe vraiment :** Les premières cuisines fonctionnaient comme le bus charter. Elles regroupaient les commandes d'inconnus en une grande fournée et terminaient tout le groupe ensemble, donc celui qui demandait une phrase attendait derrière celui qui demandait dix pages — des places perdues, du temps perdu. Les cuisines modernes replanifient le groupe à chaque morceau de mot qui sort : les commandes finies partent instantanément, les nouvelles entrent instantanément. C'est pourquoi le rythme de l'IA peut ralentir aux heures de pointe alors que rien dans votre question n'a changé — vous êtes dans un bus qui marque plus d'arrêts.

> **Pourquoi cela compte pour vous :** Quand l'IA semble soudain plus lente le soir, ce n'est presque jamais votre question ni le cerveau — c'est l'heure de pointe dans la cuisine partagée. Le savoir vous empêche de « réparer » la mauvaise chose, comme réécrire une question parfaitement correcte.

## 2. Le carnet de la cuisine : plus de papier gaspillé, entrées partagées

> **En une phrase :** Pendant qu'elle travaille votre commande, la cuisine tient un carnet vivant de tout ce que vous avez dit et fait jusqu'ici, et elle est devenue maligne avec ce carnet — des bribes n'importe où, pas des rangées parfaites, et les pages identiques écrites une seule fois.

> **L'image du quotidien :** Imaginez un hôtel qui exigeait autrefois de chaque client qu'il réserve une rangée ininterrompue de chambres pour son plus long séjour possible. Un client qui resterait peut-être dix nuits recevait dix chambres — et repartait le plus souvent après deux, laissant des chambres réservées-vides inutilisables. L'hôtel était à moitié vide et refusait quand même du monde. La nouvelle politique : les nuits de n'importe quel client peuvent occuper n'importe quelles chambres, et la réception tient un registre qui dit quelle chambre abrite quelle nuit. D'un coup, presque plus rien ne se perd.

> **Ce qui se passe vraiment :** Le carnet de la cuisine — sa copie vivante de votre commande en cours — était tenu à l'ancienne, gaspilleuse, et dans les mesures que relatent les sources du livre, seulement environ un quart à un tiers contenait quelque chose d'utile. Deux correctifs ont tout changé. Premièrement, le carnet vit désormais en bribes de même taille n'importe où en mémoire, suivies par un registre, donc les trous sont toujours réutilisables. Deuxièmement — la partie belle — quand de nombreuses requêtes commencent par la même page d'instructions (disons plusieurs copies d'un même assistant, ou les nuées d'assistants que vous rencontrerez dans la Partie IV), la cuisine écrit cette page partagée une seule fois et tout le monde la pointe, comme chaque table partageant une seule assiette d'entrées au lieu de commander cent assiettes identiques.

> **Pourquoi cela compte pour vous :** Redemander à l'IA avec les mêmes mots d'ouverture — mêmes instructions, mêmes documents — peut être presque gratuit et bien plus rapide la deuxième fois, parce que la cuisine reconnaît ses propres notes. Changez un seul mot au début, en revanche, et les notes ne correspondent plus : vous repayez le prix plein. L'endroit où vous placez vos changements compte autant que ce que vous changez.

## 3. Lire tout le menu, puis dresser chaque plat

> **En une phrase :** Toute commande contient en secret deux travaux différents — une grande lecture rapide de tout ce que vous avez fourni, puis une production lente et soigneuse de la réponse, morceau de mot par morceau — et ils se gênent quand ils partagent le même comptoir.

> **L'image du quotidien :** Un camion-restaurant avec un seul comptoir. Un traiteur arrive avec une commande de quatre cents tacos — merveilleuse affaire, les fours pleins, très efficace. Mais pendant que cette commande géante monopolise le comptoir, chaque client au volant se tient là, sans taco. La cuisine fait son travail le plus efficace à l'instant précis où il semble le plus lent à tous les autres.

> **Ce qui se passe vraiment :** Lire l'intégralité de votre requête — la longue partie avec vos instructions et vos documents — c'est le travail du traiteur : expédié en une passe puissante. Produire la réponse, c'est le travail du client au volant : un petit pas à la fois, chaque pas rapide mais impossible à sauter, parce que chaque morceau de mot dépend du précédent. Les vieilles cuisines faisaient tout le monde partager un seul comptoir : dès qu'un travail de lecture géant arrivait, chaque réponse déjà en cours se figeait en pleine phrase. Les cuisines modernes découpent le travail de lecture géant en plateaux glissés entre les tickets ordinaires, donc les réponses en cours gardent leur rythme et démarrent juste un peu plus tard.

> **Pourquoi cela compte pour vous :** Cette pause mystérieuse en pleine réponse — l'IA écrivant fluidement, puis hoquetant un instant — c'est souvent le document géant de quelqu'un d'autre en train d'être lu. Et vos propres longues requêtes font pareil aux autres. Les longs copier-coller ne sont pas gratuits, même quand la réponse finit courte.

## 4. Deviner en avance, vérifier en bloc

> **En une phrase :** La cuisine peut laisser un cuisinier junior griffonner plusieurs morceaux de mots probables, puis faire vérifier le tout d'un seul coup d'œil par le chef — et quand les suppositions sont bonnes, vous obtenez plusieurs morceaux pour le prix d'un.

> **L'image du quotidien :** Une grille de Sudoku terminée demande une heure à résoudre à la plupart des gens, mais environ une minute à vérifier. Imaginez maintenant que le champion de Sudoku facture à la minute, et qu'un ami zélé noircit cinq suppositions avant que le champion ne regarde. Un seul survol — à peine plus de travail que vérifier une case — garde ce qui est juste et corrige ce qui est faux. Même champion, même tarif, bien plus de cases finies par heure.

> **Ce qui se passe vraiment :** Produire un morceau de mot demande normalement une passe complète du cerveau entier — c'est le péage incontournable, parce que chaque morceau dépend du précédent. L'astuce, c'est que vérifier plusieurs morceaux proposés coûte presque autant que d'en produire un, puisque la partie chère est d'aller chercher le savoir du cerveau, pas de jeter un œil à quelques suppositions une fois ce savoir rapatrié. Un devineur pas cher propose quelques morceaux d'avance, le vrai cerveau les passe tous en revue d'un coup, garde les bons, réécrit à la première erreur — et, remarquablement, le texte final est conçu pour sortir exactement comme si le vrai cerveau avait écrit chaque morceau lui-même. Pas une imitation au rabais ; les mêmes mots, plus vite.

> **Pourquoi cela compte pour vous :** C'est l'une des rares astuces de vitesse qui ne coûte aucune qualité — quand elle s'applique. Elle brille quand l'IA reformule ou continue un texte qui ressemble à ce qu'on lui a donné, et elle aide le moins quand la réponse doit suivre des formes strictes, comme des formats exacts, où les suppositions partent sans cesse à la corbeille. Si vous dirigez votre propre cuisine (plus sur les cuisines maison dans la Partie IV), cet interrupteur à lui seul peut doubler la vitesse d'écriture d'un gros cerveau sur la même machine.

## 5. Écrire plus petit

> **En une phrase :** Le savoir du cerveau peut être noté avec moins de chiffres par nombre — comme garder les recettes en sténo plutôt qu'en paragraphes entiers — ce qui rend la cuisine plus rapide simplement parce qu'elle a moins à porter, au petit coût occasionnel d'une erreur de lecture.

> **L'image du quotidien :** La recette maîtresse d'une boulangerie dit « 0,8473 tasse de sucre ». Un nouveau cuisinier note « environ trois quarts de tasse ». Pour des crêpes, personne ne voit la différence. Pour une macaron — où la chimie punit les infimes erreurs — la fournée rate parfois. Même recette, moins de décimales, lecture plus rapide, casse occasionnelle.

> **Ce qui se passe vraiment :** Tout ce que le cerveau sait est stocké sous forme de nombres, et acheminer ces nombres de la mémoire vers l'endroit où on les utilise est le vrai goulot d'étranglement de la vitesse d'écriture. Arrondissez chaque nombre à moins de chiffres — stockez le sténo — et il y a simplement moins à transporter : moitié moins de chiffres, environ deux fois la vitesse ; quatre fois moins de chiffres, environ quatre fois la vitesse. Le hic : quelques-uns de ces nombres comptent bien plus que les autres, comme le sel et le safran dans la recette, donc les bonnes méthodes d'arrondi observent d'abord le trafic réel pour apprendre quels nombres protéger. Un arrondi négligé abîme discrètement les tâches les plus dures — le long raisonnement soigneux et les maths délicates — tandis que les tâches simples sortent intactes ; c'est pourquoi des versions plus petites et plus rapides du même cerveau coexistent sur un menu à des prix très différents.

> **Pourquoi cela compte pour vous :** Quand une entreprise propose une version « rapide » ou « mini » d'une IA que vous aimez, c'est en général le même cerveau écrit en sténo. Pour rédiger, résumer et les questions du quotidien, prenez la petite, rapide et pas chère. Pour le raisonnement difficile où une petite erreur gâche tout, payez l'original pleine précision — ou testez d'abord la petite sur vos propres exemples les plus coriaces.

## 6. Une commande géante : plusieurs feux, et le problème du mariage

> **En une phrase :** Quand une commande dépasse une seule cuisine — parce que le cerveau lui-même est trop gros, ou parce que la conversation est trop longue — le travail se répartit sur plusieurs cuisines, et les très longues conversations coûtent bien plus cher que leur longueur ne le suggère.

> **L'image du quotidien :** Un traiteur gagne un mariage. Le recueil de recettes ne tient plus dans une cuisine, alors on le découpe : chaque cuisine garde une tranche des recettes, chaque cuisine garde une tranche des invités, et des coursiers portent des plats à moitié finis entre les cuisines pour que le mariage semble sortir d'un seul feu. Ça marche — mais les coursiers n'arrêtent pas, et plus le mariage est grand, plus les courses mangent le bénéfice.

> **Ce qui se passe vraiment :** Deux choses différentes finissent par dépasser une cuisine. D'abord, les plus gros cerveaux sont physiquement plus vastes qu'une seule puce ne peut contenir, donc leur savoir est réparti sur plusieurs puces qui doivent se passer des fragments en permanence — couper les recettes, couper les invités, ou ouvrir des succursales identiques. Les plus gros cerveaux modernes vont plus loin encore : ils gardent une foule de spécialistes où chaque morceau de mot ne consulte que les quelques spécialistes dont il a besoin — ce qui explique qu'un cerveau géant peut parfois répondre plus vite qu'un plus petit touche-à-tout. Ensuite, une très longue conversation est son propre mariage : avant que l'IA dise un mot, tout ce que vous avez fourni doit être recoupé avec tout le reste, et ce recoupement croît douloureusement vite — doubler le tas fait bien plus que doubler la vérification.

> **Pourquoi cela compte pour vous :** Les très longues conversations ne sont pas tarifées comme des courtes un peu plus longues — les entreprises les facturent en supplément, et certaines augmentent le prix au morceau dès que vous franchissez un palier de taille. Le remède est de l'ordre du ménage : gardez les instructions et documents invariables au début (pour que les notes partagées fonctionnent, idée deux), et élaguez ou résumez le milieu plutôt que de laisser tout s'empiler. Une longue conversation bien tenue coûte souvent plusieurs fois moins cher qu'une conversation brouillonne de même utilité.

---

## La partie en une respiration

La cuisine regroupe des inconnus pour économiser le carburant et replanifie le groupe à chaque morceau de mot. Elle garde son carnet vivant en bribes réutilisables et écrit les pages partagées une seule fois. Elle sépare les deux travaux — lire votre tas, puis dresser la réponse — pour qu'aucun ne fige l'autre. Elle laisse un cuisinier junior deviner et le chef vérifier en bloc. Elle écrit les recettes en sténo pour porter moins. Et quand une commande dépasse une cuisine — un cerveau géant ou une conversation de longueur de mariage — elle répartit le travail et facture en conséquence. Rien de tout cela n'est le cerveau — et pourtant tout cela décide comment le cerveau vous apparaît.
# Partie III — Le pacte entre vous et la cuisine

Les deux premières parties de ce guide sont entrées dans la cuisine : la monnaie des morceaux de mots, les allers-retours, l'astuce de la commande groupée, la copie vivante de votre commande. Cette partie parle du pacte — le contrat tacite entre vous et la cuisine qui décide comment votre plat arrive, sous quelle forme, ce que coûte votre répétition, à quelle vitesse vous avez le droit de commander, et comment vous tenir quand la maison est débordée. Ces cinq idées sont l'endroit où la plupart des gens perdent le plus d'argent sans jamais s'en rendre compte.

## 1. Les plats arrivent un par un — et la première assiette est la plus longue à attendre

> **En une phrase :** Une bonne cuisine ne vous fait pas attendre que tout le repas soit emballé pour voir de la nourriture — les assiettes sortent dès qu'elles sont prêtes, et pour les réponses courtes, presque toute votre attente se joue avant la toute première assiette ; pour les longues, le rythme entre les assiettes s'accumule discrètement.
>
> **L'image du quotidien :** Un restaurant de sushis au tapis roulant. Vous vous asseyez, vous commandez, et dès que la première assiette est prête elle glisse vers vous — puis la suivante, puis la suivante, à un rythme régulier. L'alternative, c'est la commande emportée sous boîte : vous restez au comptoir, affamé, à ne rien voir, jusqu'à ce que le repas entier apparaisse d'un coup. Même nourriture, même cuisine — expérience de l'attente complètement différente.
>
> **Ce qui se passe vraiment :** Chaque réponse contient deux attentes distinctes empilées : une attente plus longue avant l'apparition du premier morceau, puis un rythme rapide et régulier entre les morceaux ensuite. Une réponse qui paraît vive mais « tape » lentement a un problème de rythme. Une réponse qui reste muette avant de dire quoi que ce soit a un problème de première assiette — et aucune montée en gamme de vitesse de frappe ne répare une attente de première assiette. Il y a aussi un danger caché : si vous partez en pleine commande (annulation, application fermée, connexion perdue), la cuisine au coin du rue peut ne pas s'en apercevoir pendant un moment — et elle continue de cuisiner votre repas, en vous le facturant peut-être, jusqu'à ce qu'un coursier refasse le tour du coin et prévienne le cuisinier que vous êtes parti.
>
> **Pourquoi cela compte pour vous :** Quand un outil bâti sur l'IA semble lent, regardez *où* se trouve l'attente — avant le premier mot, ou entre les mots — car ces deux attentes ont des propriétaires différents et des remèdes complètement différents. Et quand vous annulez, partez du principe que la cuisine peut continuer à cuisiner jusqu'à ce qu'elle s'en rende compte.

## 2. Commander sur un formulaire plutôt qu'en dissertation

> **En une phrase :** Parfois il vous faut la réponse de la cuisine dans une forme fixe — un formulaire rempli, pas une dissertation — et il existe une vraie machine qui garantit la forme, mais la garantie coûte un effort à la cuisine et peut gêner la cuisson.
>
> **L'image du quotidien :** Vous remplissez un formulaire papier, touche par touche, tandis qu'un surveillant strict se tient derrière vous. Avant chaque frappe, le surveillant recouvre les touches qui ne peuvent légalement pas venir ensuite. Là où le formulaire dit « âge », les touches à lettres sont recouvertes — seuls les chiffres restent libres. Vous choisissez toujours *quel* chiffre ; vous pouvez toujours vous tromper d'âge. Mais vous ne pouvez physiquement pas écrire « trente » dans la case âge. Le surveillant, c'est la garantie. Les touches recouvertes, c'est son prix.
>
> **Ce qui se passe vraiment :** Certaines entreprises d'IA offrent « le surveillant » intégré : la réponse est forcée dans la forme exacte que vous avez spécifiée, à chaque fois, en bloquant les morceaux mal formés au fil de leur production. Ça marche — mais ça coûte trois fois. Le règlement doit être transporté à chaque voyage, que vous l'ouvriez ou non ; un petit péage est payé à chaque mot tant que les règles s'appliquent ; et — la partie que personne n'affiche — le formulaire se bat parfois contre la manière dont le cuisinier voulait cuisiner, et le plat sort un peu moins bon qu'en dissertation libre. Méfiez-vous aussi des petites lignes : chez certaines entreprises, « forme garantie » signifie que le formulaire est certifié conforme ; chez d'autres, cela veut seulement dire que la réponse arrive *dans une boîte*, et n'importe quoi peut gigoter à l'intérieur.
>
> **Pourquoi cela compte pour vous :** Si une machine lit la réponse de l'IA après vous, exigez le formulaire — une seule réponse mal formée peut faire planter tout ce qui suit. Si un humain la lit, laissez le chef écrire sa dissertation. Et ne faites jamais confiance au mot « structuré » sur un menu sans demander quelle promesse il désigne.

## 3. La cuisine se souvient de votre commande habituelle

> **En une phrase :** Si vous envoyez encore et encore les mêmes mots d'ouverture — vos instructions permanentes, votre habitude — la cuisine peut garder une copie du travail de lecture déjà fait, et réutiliser cette copie peut coûter environ dix fois moins cher que d'envoyer des mots frais.
>
> **L'image du quotidien :** Une carte de fidélité de café. L'inscription coûte un peu plus qu'un café normal — un petit droit d'ouverture de carte. Mais chaque visite suivante avec la carte est environ quatre-vingt-dix pour cent moins chère. Le hic : la carte expire quelques minutes après chaque achat. Commandez, buvez, recommandez dans la fenêtre, et la carte vit éternellement. Éloignez-vous six minutes et le café brûle la carte — et votre visite suivante repaye un droit d'inscription flambant neuf.
>
> **Ce qui se passe vraiment :** Les entreprises d'IA peuvent stocker le travail de lecture déjà effectué sur la partie d'ouverture de votre requête, et vous facturer une petite fraction du prix pour le réutiliser — à condition que l'ouverture soit *exactement* la même, morceau par morceau, à chaque fois. C'est là que l'argent se cache. Le piège est silencieux : changez un seul mot dans la partie permanente — un horodatage, la date du jour, n'importe quoi — et tout ce qui suit ce changement est traité comme neuf, au prix plein, éventuellement avec un droit d'ouverture par-dessus, pour chaque requête qui suit. La règle des pros : figez l'ouverture comme un papier à en-tête imprimé (logo, adresse, mentions légales) et placez tout ce qui change — la date, la question du jour — tout à la fin.
>
> **Pourquoi cela compte pour vous :** Se répéter n'est pas seulement du gaspillage — c'est le *plus gros coût contrôlable* de tout ce commerce. Un seul horodatage sournois dans vos instructions permanentes peut silencieusement multiplier votre facture, et vous ne le verriez jamais sans savoir que ce pacte existait.

## 4. La politique de la porte : trop de commandes trop vite

> **En une phrase :** Chaque cuisine limite la vitesse à laquelle vous pouvez envoyer des commandes — pas pour vous punir, mais parce que la canalisation partagée derrière le bâtiment ne transporte qu'une quantité d'eau limitée — et la bonne réponse dépend de *pourquoi* on vous a refoulé.
>
> **L'image du quotidien :** L'arrivée d'eau d'un immeuble. La conduite de rue est un tuyau de diamètre fixe ; personne dans l'immeuble ne peut le changer. Si tout le monde se douche à sept heures du matin, la pression baisse pour tous — alors le service d'eau équipe chaque appartement d'un réducteur de débit. Le réducteur ne fait pas la morale à vos douches ; il protège le tuyau que tout le monde partage. Un refus « trop de requêtes », c'est ce réducteur, habillé en politique de la porte.
>
> **Ce qui se passe vraiment :** Quand on vous refoule, la raison compte. « Vous avez déjà commandé trois fois cette minute » concerne votre rythme — attendez un instant et revenez. « Votre ardoise a atteint son plafond » concerne votre portefeuille — aucune attente devant la porte n'y changera rien ce soir ; revenez quand le forfait se réinitialise. « La cuisine est en feu » les concerne *eux* — tout le monde attend, vous compris, et aucune table n'arrive. Les trois sonnent pareil de loin (un refus), mais seul le premier s'arrange en réessayant. Et voici le piège : si toute une volée d'assistants automatisés se fait refouler et que tous frappent à nouveau au même instant, ils doublent la surcharge même dont ils souffrent. Les assistants bien élevés choisissent chacun leur propre moment au hasard pour recommencer.
>
> **Pourquoi cela compte pour vous :** Le coup gagnant n'est pas de réessayer plus intelligemment — c'est le *calage du rythme* : un bon assistant lit la politique de la porte, envoie ses commandes à la vitesse que la politique autorise, et ne se fait jamais refouler. Sachez aussi que les cuisines ne comptent pas pareil : certaines imputent sur votre quota le plus gros plat que vous *pourriez* commander, pas celui que vous avez réellement mangé.

## 5. Choisir les cuisines selon le travail

> **En une phrase :** Tous les repas n'exigent pas la même cuisine — envoyez le déjeuner rapide au petit diner rapide, le banquet géant au traiteur gros et pas cher, et faites correspondre la cuisine au travail avant de commander.
>
> **L'image du quotidien :** L'infirmière de triage d'un hôpital. La grippe va au médecin généraliste ; la douleur thoracique va au chirurgien. Elle n'est pas radine — elle fait correspondre le coût au besoin, parce que les chirurgiens sont chers et rares, et que la plupart des patients ne relèvent pas de la chirurgie. Envoyez tout le monde chez le chirurgien « par précaution » et vous échouez deux fois : la chirurgie se dilue, et la facture explose.
>
> **Ce qui se passe vraiment :** La plupart du travail que vous envoyez à une IA est facile — trier, étiqueter, réponses courtes — et une IA pas chère et rapide le fait aussi bien que le vaisseau amiral coûteux. L'astuce est de savoir lequel est lequel *avant* que la commande parte, et c'est une compétence qui s'apprend : les équipes qui routent les demandes faciles vers la cuisine pas chère et les dures vers la cuisine forte rapportent des factures réduites environ de moitié, en perdant à peine de la qualité. Il y a aussi une remise permanente que personne n'utilise assez : la voie de nuit. Tout ce qui a juste besoin d'arriver *finalement* — une pile de rapports dus demain matin, une vérification nocturne — peut voyager par la livraison de nuit à moitié prix, nourriture identique, arrivée plus lente.
>
> **Pourquoi cela compte pour vous :** L'habitude la plus coûteuse est d'envoyer tout à la cuisine la plus forte et la plus chère « par précaution ». Choisissez deux cuisines — une pas chère, une forte — et décidez quelles commandes exigent laquelle. Et mettez votre travail répétable, que personne n'attend, sur la voie de nuit ; refuser un coupon permanent de moitié prix, c'est faire cadeau au service de livraison.

## 6. Quand votre cuisine préférée ferme

> **En une phrase :** Tout habitué a besoin d'une cuisine de secours — choisie à l'avance, essayée dans l'ordre, avec une règle pour savoir quand abandonner l'une et passer à la suivante — parce que le jour où votre favorite déborde ou ferme, toute votre opération ne doit pas s'arrêter avec elle.
>
> **L'image du quotidien :** Un tableau électrique dans une maison. Le courant passe normalement jusqu'à ce que les défauts franchissent une limite — alors le fusible saute, et chaque tentative suivante sur cette prise échoue *instantanément, au niveau du fusible*, sans que l'électricité fasse jamais le voyage dangereux. Après une pause, on réessaie la prise avec quelques lumières seulement : si le défaut a disparu, le circuit se referme ; si le nouveau fusible saute aussi, la prise reste morte. On ne cesse pas de rebrancher un appareil défectueux pour « vérifier » — c'est le fusible qui vérifie, avec un filet de courant, pas avec toute la maison.
>
> **Ce qui se passe vraiment :** Les installations bien construites tiennent une liste ordonnée de cuisines : si la première ne peut pas prendre la commande après quelques tentatives honnêtes, l'appel passe à la deuxième, puis à la troisième. Une règle compte plus que les autres : installez-vous à table au *début* du repas, pas entre chaque plat. Le pacte mémoire de l'idée trois ne fonctionne que si vous continuez d'envoyer votre commande à la *même* cuisine — chaque saut vers une autre signifie que la nouvelle cuisine n'a jamais vu vos instructions permanentes et doit refaire (et refacturer) tout ce travail de lecture. Bondissez sans cesse d'une cuisine à l'autre et vous payez discrètement le droit d'inscription partout, à chaque fois.
>
> **Pourquoi cela compte pour vous :** Résilience et remise tirent dans des sens opposés, et connaître cette tension est la marque de quelqu'un qui comprend ce métier. Choisissez vos solutions de repli *avant* l'urgence — et une fois le repas commencé, restez fidèle à votre cuisine, sauf si elle brûle vraiment.

---

*Voilà tout le pacte : surveillez les assiettes, commandez sur formulaire quand une machine lit la réponse, gardez votre commande permanente figée, respectez la politique de la porte, faites correspondre la cuisine au repas, et ayez toujours une solution de repli. La Partie IV rassemble tout.*
# Partie IV — Vous, le client malin : faire en sorte que le restaurant se souvienne de vous

Les trois premières parties vous ont fait traverser la cuisine : comment les commandes sont regroupées, pourquoi écrire est plus lent que lire, et ce que l'entreprise facture. Cette dernière partie parle de vous — le client. Les clients qui connaissent une étrange règle des restaurants paient une fraction de ce que paient tous les autres. Voici la dernière partie du livre en six idées.

## 1. Dites vos mots d'ouverture exactement de la même façon, à chaque fois

> **En une phrase :** La cuisine garde une copie vivante de votre commande en cours, et si votre prochaine requête commence par exactement les mêmes mots que la dernière fois, elle vous facture une fraction du prix pour ces mots — mais changez un seul mot, n'importe où au début, et elle relit tout ce qui suit ce changement au prix plein, plus un petit droit pour reconstruire sa copie.
>
> **L'image du quotidien :** Un habitué qui commande « comme d'habitude » chaque matin. La serveuse a toute votre commande permanente en tête, et chaque ajout (« et une tranche de lard ») se pose par-dessus ce qu'elle sait déjà. Mais imaginez qu'elle la garde sur un tableau blanc, avec une règle impitoyable : au moment où vous reformulez *une seule* ligne vers le haut, elle essuie le tableau à partir de cette ligne et reprend toute votre commande, de zéro, au prix plein de la carte. Dites « toast » avant « œufs » une seule fois, et vous redevenez un inconnu.
>
> **Ce qui se passe vraiment :** Quand vous parlez à une IA sur de nombreux tours, tout ce que vous envoyez est relu par la cuisine de l'entreprise à chaque tour — vos instructions, vos outils, et toute la conversation jusqu'ici. La cuisine garde discrètement une copie vivante de tout ce qu'elle a déjà lu, donc les ouvertures identiques sont lues à environ un dixième du prix normal. Mais l'économie n'existe que tant que les mots correspondent exactement, depuis le tout premier mot. Le remède, c'est la discipline : gardez les parties qui ne changent jamais — instructions permanentes, règles, documents de référence — figées en haut, toujours dans le même ordre et le même libellé, et ne laissez que du nouveau s'empiler à la fin.
>
> **Pourquoi cela compte pour vous :** Une longue conversation menée ainsi coûte une petite fraction de la même conversation menée négligemment — mêmes mots, mêmes réponses, facture très différente. Même quelque chose d'invisible, comme votre logiciel qui réordonne vos instructions différemment à chaque envoi, peut discrètement faire payer chaque requête au prix plein sans que rien à l'écran n'ait l'air différent.

## 2. Ne réécrivez pas votre commande au milieu du repas

> **En une phrase :** Remplacer votre longue commande en cours par un court résumé vaut parfois le coup, et parfois c'est un gaspillage — cela coûte toujours une relecture au prix plein une fois, et cela ne se rentabilise que si suffisamment de futurs allers-retours profiteront de la commande plus courte et moins chère.
>
> **L'image du quotidien :** Vous êtes au restaurant depuis des heures, et le ticket suspendu en cuisine fait des pages. Vous pourriez demander au personnel de le déchirer et d'ouvrir un ticket neuf d'une ligne : « table quatre — comme d'habitude, plus tout ce qui a été décidé depuis quatorze heures ». Désormais la cuisine lit une ligne au lieu de quatre pages. Mais ce ticket neuf est écrit comme si vous étiez un client inconnu : tout est relu au prix plein une dernière fois, et l'ancienne économie disparaît. Faites-le juste avant de payer et de partir, et vous aurez payé un raccourci que vous n'avez jamais utilisé.
>
> **Ce qui se passe vraiment :** Les longues conversations d'IA finissent par être comprimées — les premiers échanges remplacés par un court résumé écrit — pour que la conversation reste assez petite pour continuer à fonctionner. La compression a un prix caché : elle casse l'économie de copie vivante à partir de la première ligne résumée, donc la requête suivante paie le plein tarif une fois, et profite ensuite seulement de lectures moins chères sur un historique bien plus court. La règle pratique : compressez quand il vous reste encore longtemps à travailler, jamais dans la dernière ligne droite, et — ce que presque tout le monde fait à l'envers — compressez *avant* de vous absenter un moment, pas après être revenu.
>
> **Pourquoi cela compte pour vous :** Mal caler la compression est l'un des moyens silencieux de doubler la facture d'une longue session de travail ; bien la caler — condenser juste avant une longue pause — est l'un des moyens les plus simples de la réduire.

## 3. La cuisine vous oublie si vous vous taisez

> **En une phrase :** La copie vivante que la cuisine garde de votre commande a une date de péremption qui se compte en minutes de silence, et une fois expirée, vous revenez comme un inconnu avec une commande identique — relecture au prix plein, plus le droit de reconstruction, plus une première réponse lente pendant que la cuisine relit tout.
>
> **L'image du quotidien :** Un vestiaire qui ne garde votre manteau que cinq minutes après votre dernier contact avec le ticket. Continuez à parler et l'horloge se réinitialise gratuitement sans cesse. Partez déjeuner, revenez à quatorze heures, et votre manteau est retourné dans le tas — l'employée ira le chercher, mais vous restez au comptoir pendant qu'elle le retrouve, le vérifie et vous le tend comme si vous n'étiez jamais venu. Rien de ce qui vous appartenait n'a été perdu ; vous avez juste rejoint le fond de la file.
>
> **Ce qui se passe vraiment :** Chaque réponse que vous recevez pousse discrètement le souvenir que la cuisine a de vous vers le futur, donc une conversation qui continue ne remarque jamais l'horloge. Au moment où vous marquez une pause plus longue que le silence autorisé, la copie sauvegardée est abandonnée. Votre message suivant repaie le coût de lecture de tout votre historique — et comme la réponse ne peut pas commencer avant la fin de la relecture, le premier mot de votre retour est nettement en retard. Certains forfaits offrent un silence plus long contre un droit de reconstruction un peu plus lourd — rentable dès que votre journée compte deux longues pauses ou plus.
>
> **Pourquoi cela compte pour vous :** Si votre assistant paraît instantané pendant que vous travaillez et pataud quand vous revenez de vos réunions, rien n'est cassé et personne n'est lent — vous repayez simplement le droit d'entrée à chaque fois. En le sachant, vous pouvez choisir le forfait qui correspond à votre vraie façon de marquer des pauses.

## 4. Envoyez des assistants qui portent le manuel, pas toute l'histoire

> **En une phrase :** Quand votre assistant envoie des assistants-adjoints faire des recherches, poser des questions ou vérifier des choses, un système bien géré donne à chaque adjoint les mêmes pages d'ouverture figées — comme un manuel d'entreprise — pour que la cuisine les ait déjà lues et ne facture presque rien à chaque nouvel adjoint.
>
> **L'image du quotidien :** Un siège qui embauche cinquante inspecteurs de terrain. Au lieu d'écrire à chaque inspecteur un briefing personnalisé de cinquante pages, il imprime un manuel standard — lecture du premier jour pour tous les nouveaux — et ajoute une seule page d'instructions spécifiques par inspecteur. Le siège paie pour faire lire le manuel une fois. Chaque nouvel inspecteur arrive « pré-lu », ne portant que sa page fraîche. Comparez avec cinquante inspecteurs qui récitent chacun toute l'histoire de l'entreprise au téléphone, un par un, aux tarifs longue distance.
>
> **Ce qui se passe vraiment :** Les grosses tâches d'IA sont souvent réparties entre plusieurs assistants plus petits — l'un lit des documents, l'un vérifie des chiffres, l'un rédige le rapport. Chacun envoie sa propre requête complète à la cuisine. Si la partie invariable — règles, outils, contexte — est identique mot pour mot chez tous, la copie sauvegardée de la cuisine couvre presque tout, et chaque adjoint ne coûte que sa partie unique. Les adjoints qui racontent chacun toute l'histoire paient le prix plein à chaque fois, et une nuée d'entre eux paie tout d'un coup — exactement ainsi que des clients polis surchargent la cuisine sans le vouloir.
>
> **Pourquoi cela compte pour vous :** Avec un manuel figé partagé, une équipe d'adjoints coûte à peine plus cher qu'un seul assistant faisant tout seul ; sans manuel, la même équipe multiplie votre facture par la taille de l'équipe — et ralentit tout le monde.

## 5. Lisez vos reçus — chacun d'entre eux

> **En une phrase :** Chaque requête que vous envoyez revient avec un reçu détaillé — combien a été lu frais, combien a été reconnu de la fois précédente, combien a été écrit, combien de temps chaque partie a pris — et les clients qui lisent ces reçus cessent de deviner et commencent à piloter.
>
> **L'image du quotidien :** Une passagère de taxi qui garde chaque ticket dans une boîte à chaussures. En fin de mois, elle ne discute pas des taxis en général ; elle pointe le relevé — ce trajet, ce tarif — et sait quelles courses valent le coup et quel jour la tarification de pointe a doublé. La boîte à chaussures transforme « les taxis, c'est cher » en une décision sur *ce* trajet, *cette* semaine.
>
> **Ce qui se passe vraiment :** Chaque réponse transporte discrètement les détails de sa propre facture — les morceaux lus frais par la cuisine, les morceaux reconnus de sa copie sauvegardée de vous, les morceaux écrits, et le moment d'arrivée du premier mot. La plupart des outils les cachent ; ceux qui les montrent transforment la confusion en arithmétique. Une hausse soudaine de coût cesse d'être un mystère et devient une phrase visible : « la partie reconnue est tombée à zéro mardi à quatorze heures — qu'est-ce qui a changé dans nos mots d'ouverture juste avant ? »
>
> **Pourquoi cela compte pour vous :** L'habitude unique qui sépare ceux qui se plaignent des factures d'IA de ceux qui les font rétrécir, c'est la lecture des reçus — parce que chaque schéma de gaspillage décrit dans ce guide laisse une empreinte sur l'un d'eux.

## 6. Reconnaître une cuisine débordée — et garder un restaurant de secours dans sa poche

> **En une phrase :** Quand la cuisine est submergée, elle envoie des signaux sans équivoque — premiers plats en retard, rythme ralenti, porte refusant brièvement les nouveaux clients — et le client malin sait déjà quel autre restaurant sert les mêmes plats, et quand cuisiner chez soi finit par l'emporter sur manger dehors.
>
> **L'image du quotidien :** Un habitué avec deux cuisines préférées dans la même rue, qui servent les mêmes plats. Quand la première déborde — les tickets s'empilent, les premières assiettes arrivent en retard — il ne reste pas planté dans l'encadrement à crier ; il fait cinquante pas jusqu'à la deuxième. Et il a aussi fait le calcul sur la troisième option : il commande chaque soir, donc un jour ou l'autre une cuisine à la maison — payée une fois, ne coûtant plus que de l'électricité ensuite — bat toutes les factures à l'assiette de la rue. Mais il ne l'a construite qu'après avoir compté les assiettes.
>
> **Ce qui se passe vraiment :** Une cuisine d'IA surchargée se comporte de façon connaissable : votre premier mot met plus de temps à arriver, le rythme entre les mots s'étire, et l'entreprise peut brièvement refuser les nouvelles commandes d'un poli « revenez dans un instant ». Une installation bien construite traite cela comme des signaux, pas des surprises — elle remarque le ralentissement, s'arrête poliment, et bascule pour un temps vers la cuisine d'une autre entreprise, revenant quand la première s'est remise. Et pour les appétits énormes et réguliers — toute la journée, tous les jours — faire tourner la même machinerie chez soi peut finir par coûter moins cher, avec une cuisine qui n'oublie jamais votre commande et aucune file à la porte. L'arithmétique honnête du livre : les petits appétits doivent toujours louer ; les énormes appétits réguliers peuvent acheter ; la frontière dépend de l'activité réelle que votre cuisine maison aurait.
>
> **Pourquoi cela compte pour vous :** La différence entre une soirée frustrante et une soirée fluide tient rarement à la qualité d'une cuisine en particulier — elle tient à savoir si vous avez remarqué laquelle débordait, et si vous aviez ailleurs où aller avant d'avoir faim.

---

C'est tout le livre en mots simples. Le cerveau est brillant ; la cuisine décide ce qu'il vous coûte ; et le client qui comprend la cuisine — mêmes mots d'ouverture, résumés bien calés, adjoints avec un manuel partagé, reçus dans une boîte à chaussures, un restaurant de secours dans la poche — obtient la même intelligence que tout le monde pour une fraction du prix. Chacune de ces habitudes peut commencer aujourd'hui.

---

## Tout le livre sur une serviette en papier

1. Trois ouvriers se tiennent derrière chaque réponse : le cerveau, la cuisine, et vous.
2. On vous facture dans la monnaie propre de la cuisine : les morceaux de mots.
3. Les réponses arrivent un morceau à la fois — le même coureur court chaque étape du relais.
4. Le rythme est fixé par les allers-retours, pas par la réflexion. Plus de chefs n'élargissent pas l'escalier.
5. Chaque conversation utilise une copie vivante de tout ce qui a été dit — les longues discussions coûtent de l'argent réel.
6. Vous partagez la cuisine avec des inconnus. Regrouper les commandes, c'est ce qui la garde abordable.
7. Lire votre commande et écrire la réponse sont deux travaux différents à deux vitesses différentes.
8. Les cuisines devinent désormais en avant et vérifient en bloc — un cuisinier junior rédige le brouillon, le chef approuve.
9. Les notes en sténo rendent les cuisines plus rapides et occasionnellement fautives.
10. Renvoyer les mêmes mots peut coûter dix fois moins cher que d'en envoyer des frais.
11. Chaque cuisine a une politique de la porte. Aucun client n'est trop important pour la file.
12. Les clients malins choisissent leurs cuisines selon le travail : la rapide pour le déjeuner, la pas chère pour le banquet, la de secours pour les urgences.
13. Dites vos mots d'ouverture de la même façon à chaque fois, et la cuisine vous reconnaît.
14. Connaissez vos reçus. Le client qui lit la facture est celui que la facture ne peut pas surprendre.

Si vous arrivez à enseigner ces quatorze lignes à quelqu'un d'autre avec vos propres images,
vous avez le livre. Le reste, c'est du détail, de l'arithmétique, et la joie de la salle des
machines.

---

*Ce guide condense « Inference Engineering: Inside the Engine Room of AI
Agents » (série Harness Engineering, vol. II, Arbaz Khan, 2026). Le livre
complet construit les mêmes idées avec des chiffres détaillés, des systèmes
réels, et un petit compagnon fonctionnel que vous pouvez faire tourner
vous-même : github.com/arbazkhan971/inference-engineering-book*
