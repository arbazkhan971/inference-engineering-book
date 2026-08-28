# Inference Engineering — Sade Dille Rehber

*"Inference Engineering: Inside the Engine Room of AI Agents" kitabındaki her şey, herkesin takip edebileceği şekilde anlatıldı — kod yok, matematik yok, jargon yok. Bir restoran mutfağını takip edebiliyorsan, bunu da takip edebilirsin.*

---

## Buradan başla: her şeyin asılı olduğu tek fikir

Bir yapay zekâya yazıyorsun ve kelimeler geri geliyor — aslında senin için çalışan **üç farklı şey** var, tek bir şey değil.

1. **Beyin** — yapay zekâ modelinin kendisi. Öğrenilmiş bilginin dev bir yığını. Bir şirketin binasının içinde yaşar ve asla hareket etmez.
2. **Mutfak** — seninle beyin arasındaki her şey: bina, özel süper hızlı bilgisayar çipleri, personel, kuyruklar, duvardaki fiyat listesi. Mühendisler buna "çıkarım" (inference) diyor. Bu kitap işte bu kısmı anlatıyor.
3. **Sen, akıllı müşteri** — soru sorma biçimin, ne gönderdiğin, ne zaman gönderdiğin ve beklerken ne yaptığın. Mühendisler buna "harness" diyor.

İşte bütün kitabın savunduğu ana fikir: **yapay zekâ yavaş, aptal ya da pahalı hissettirdiğinde, sorun genellikle mutfaktadır — beyinde değil.** Yoğunluktan kilitlenmiş bir mutfaktaki parlak beyin sana kötü hizmet eder ve beynin ne kadar parlak olması bunu düzeltmez.

Bu rehber de mutfağı, fikir fikir, ünlü bir fizikçinin (Richard Feynman) kullandığı yöntemle gezdiriyor: bir şeyi basitçe açıklayamıyorsan, onu henüz anlamamışsındır. Aşağıdaki her fikir dört şey alır — düz bir cümle, gündelik hayattan bir tablo, gerçekte ne olduğu ve bunun senin için neden önemli olduğu.

Dört bölümü sırayla oku. Her biri yaklaşık on dakika sürer.

---

# Bölüm I — İstemin altında: üç işçi, kelime parçaları ve beklemenin bedeli

Kitabın ilk bölümü muhtemelen hiç sormadığın bir soruyu yanıtlıyor: bir yapay zekâya yazdığımda ve kelimeler geri geldiğinde, *bu işi yapan kim?* Cevap "üç farklı şey" — ve hangisinin zorlandığını bilmek, sorunu çözmek ile yanlış tamirat için ödeme yapmak arasındaki farktır. Sonra bu işin tamamının fiyatlandığı garip birimle tanışıyor, cevapların neden ancak adım adım gelebildiğini öğreniyor ve uzun sohbetleri pahalı yapan gizli defteri keşfediyoruz.

## 1. Her cevabın arkasında üç işçi durur

> **Tek cümlede:** Aldığın her cevap üç farklı işçi tarafından üretilir — bilgisi olan bir beyin, onu sana servis eden bir mutfak ve siparişini taşıyan bir garson — ve "yapay zekâ bugün yavaşladı" anlarının çoğu aslında mutfak anlarıdır.
>
> **Gündelik tablo:** Bir restoran. Şef harika — o beyin. Şefin etrafındaki mutfak — fırınlar, personel, sipariş fişlerinin asıldığı ray — yapay zekâ şirketinin binlerce insana aynı anda hizmet etmek için kurduğu her şeydir. Garson ise sensin ve soru sorma biçimin: fişe ne yazıldığı, ne zaman verildiği, geri gelen bir şey yanlış olduğunda ne olduğu. Yanlış tabak gelirse, o şeftir. Doğru tabak, mutfak kilitlendiği için soğuk ve geç gelirse, o mutfaktır. Fiş raydan uçtuğu için tabak hiç gelmezse, o garsondur.
>
> **Gerçekte ne oluyor:** Bir mesaj gönderdiğinde, o mesaj yapay zekâ şirketinin binasına yolculuk eder, kotalarına karşı kontrol edilir, bir kuyrukta bekler ve bir kerede okunur — cevabın yazılmasına ancak bundan sonra, küçük parçalar halinde başlanır. Beyinin tek işi bilmektir. "Gönder" tuşuna basman ile cevabın ilk parçası arasındaki her şey — kontrol, bekleme, okuma — mutfak işidir: şirketin kurup işlettiği makineler. Ve çoğu insanın gözünden kaçan nokta şu: bir garson mutfağı tıkayabilir (kötü sorar, çok sık sorar), ama bir mutfak hiçbir zaman şefin bir tarifi unutmasını sağlayamaz. Suç tek yönde akar.
>
> **Neden önemli:** Şikâyet etmeden önce arızayı etiketle. Yanlış ya da saçma cevap — beyin. Doğru ama geç ya da kesintiye uğramış cevap — mutfak. İstek hiç düzgün gönderilmemiş ya da panikle beş kez gönderilmiş — garson. Bu işte boşa giden paranın çoğu, asıl sorun mutfakken beyin değiştirmekten gelir.

## 2. Kelime parçaları: her yapay zekâ şirketinin özel para birimi

> **Tek cümlede:** Yapay zekâ şirketleri senin kelimelerini ya da harflerini saymaz — kendi icat ettikleri metin yığınları olan "kelime parçalarını" sayar ve her şirket metni farklı doğrar.
>
> **Gündelik tablo:** Cebinde yalnızca dolarla yurt dışına seyahat etmek. indiğin ülke her şeyi kendi parasıyla fiyatlar — menü, benzin pompası, taksimetre — ve her ülkenin kendi kur vardır. Hesabın daima *onların* parasıyla, asla seninkiyle hesaplanır ve sınır geçtiğinde kur sessizce değişir.
>
> **Gerçekte ne oluyor:** Beyin bir şeyi okumadan önce, bir doğrama makinesi metnini, şirketin önceden eğittiği sabit bir katalogdaki parçalara böler. Yaygın kelimeler genellikle tek parça olur; daha seyrek ya da uzun kelimeler birkaç parçaya doğranır; diğer diller ve uzun sayı dizileri çoğu zaman düz İngilizceden çok daha fazla parçaya mal olur. Hiç faturalandırıldığın her şey — gönderdiğin şeyin boyutu, cevabın boyutu, hız limitlerin, kotaların — bu parçalarla, şirketin kendi para birimiyle ölçülür.
>
> **Neden önemli:** Fatura kelimelerle değil, parçalarla kesilir. Aynı cümle farklı şirketlerde, hatta model yükseltildiğinde aynı şirkette bile anlamlı biçimde farklı tutarlara mal olabilir — doğrama biçimi değişir ve senin faturan aynı kelimelerle birlikte değişir. Bir araç "bu yaklaşık yetmiş beş kelime tutuyor" diyorsa, bunu kaba bir tahmin gibi gör, fatura gibi değil.

## 3. Cevaplar neden ancak bir parça ile gelir

> **Tek cümlede:** Her yeni kelime parçası, o ana kadar yazılmış her şeye bakılarak seçilir; dolayısıyla yapay zekânın cevabı bir zincirdir — önceki halka var olmadan sonraki halka yapılamaz.
>
> **Gündelik tablo:** Telefonundaki klavyenin kelime öneri çubuğu. Sadece o ana kadar yazdığın her şeyi gördükten sonra sıradaki kelimeyi önerir — ilk üçü kabul etmeden dördüncü kelimeyi isteyemezsin. Cevap yazan bir yapay zekâ, "kabul et" tuşu basılı tutulmuş, makine hızında çalışan o öneri makinesidir.
>
> **Gerçekte ne oluyor:** Sorunu okumak hızlıdır, çünkü gönderdiğin her şey zaten oradadır ve tek seferde kavranabilir. Yazmak farklıdır: makine bir parça üretir, sonra onu (ve öncesindeki her şeyi) kullanarak sıradakini seçer, sonra sıradakini — tek koşuculu, disiplinli bir bayram koşusu. Bu yüzden her cevabın toplam süresinin inatçı bir şekli vardır: ilk parça için bir bekleme, sonra sona kadar her parçada bir adımlık istikrarlı bir ritim. Hiçbir ham güç makinenin öne atlamasını sağlayamaz, çünkü atlanacak parçalar henüz yoktur.
>
> **Neden önemli:** Beklemenin iki yarısının sahibi ve çözümü farklıdır. Kısa cevaplar ilk parçanın hızlı gelmesine bağlıdır; uzun cevaplar parçalar arasındaki ritme bağlıdır. Bir uygulama seri hissettiriyor ama "yavaş yazıyorsa", sorun rittir; bir şey söylemeden asılı kalıyorsa, sorun ilk parçadır — ve hiçbir yazma hızı yükseltmesi ilk parça beklemesini düzeltmez.

## 4. Beklemenin iki farklı nedeni: derin düşünmek ile getirmek

> **Tek cümlede:** Bazı bilgisayar işleri düşünce devasa olduğu için yavaştır, bazıları ise getirmek hiç bitmediği için — ve yapay zekâ cevabı yazmak çoğunlukla bir getirmek problemidir.
>
> **Gündelik tablo:** Yirmi şefi, on ocağı ve paranın satın alabileceği her aleti barındıran bir mutfak — ve arkasında, kiler'e inen tek bir dar merdiven. İki yüz soğanın doğranmasını gerektiren bir sipariş şeflerle sınırlıdır. Akşam yemeği servisi tek tek yumurta gönderiyorsa, on dokuz şef merdivenin dibinde bir sonraki yumurtayı bekleyerek durur. Daha çok şef almak yalnızca birinci türdeki yavaşlığı düzeltir.
>
> **Gerçekte ne oluyor:** Tek bir kelime parçası üretmek için makine, esasen bütün beyni — tüm öğrenilmiş bilgisi — bellekten düşünmenin gerçekleştiği yere bir kapıdan geçirmek zorundadır. Cevabının hızını düşünme gücü değil, o kapının hızı belirler. Kelimeleri izlerken içerideki şık çipin neredeyse boş durmasının nedeni budur: bilgi parçasının her birine minik bir matematik yapar, sonra sıradaki yığımın gelmesini bekler. Mutfakla on şık çip paylaşmak da *senin tek cevabını* hızlandırmaz — on çip, on başka insana hizmet eden on mutfaktır; senin tek cevabın hâlâ tek bir merdivenden iner.
>
> **Neden önemli:** Birisi bir yapay zekâyı "daha fazla işlem gücüyle hızlandıracağını" vadettiğinde, hangi yavaşlığı kastettiğini sor. Gerçek hız numaraları mutfağın yerleşimindedir — birçok insanın siparişini tek getirmek seferine gruplandırmak ya da getirilecek şeyi küçültmek. Daha çok şef, merdiveni genişletmez.

## 5. Mutfağın, siparişinin güncel kopyası

> **Tek cümlede:** Her sohbet için mutfak, o ana kadar okunan ve yazılan her şeye dair — beyinden ayrı — sürekli büyüyen bir not tutar ve bu notlar her parçayla birlikte büyür.
>
> **Gündelik tablo:** Gün boyu süren bir toplantıda tutan bir zabıt katibi. Yeni biri her konuştuğunda bütün tutanağı baştan okuyabilir, ama o, masasında her kişiye dair kısa bir not tutar — "bütçeyi sordu, sayı istiyor" — ve tutanağa değil, notlara bakar. Notlar onun çalışma belleğidir. Yerden çıkan şey ise masasıdır.
>
> **Gerçekte ne oluyor:** Sohbetin büyüdükçe makine, her kelime parçası için küçük bir not yazar — o parçanın sonrasına gelen her şey için ne anlama geldiği. Bu notlar, her yeni parçanın geçmiş işin tamamını yeniden yapmadan yazılabilmesinin nedenidir; notlar olmasaydı, konuştukça her sonraki kelime daha da yavaşlardı. Notlar, binadaki en hızlı ve en pahalı bellekte yaşar, çünkü üretilen her tek parçada onlara danışılır.
>
> **Neden önemli:** Uzun bir sohbet için bu notlar, beyinin kendisi kadar büyüyebilir — ve *sohbet başına* tutulurlar; yoğun bir mutfak her misafir için büyüyen birer defterle jonglator yapar. Bir şirket ne kadar gönderebileceğini sınırladığında, neden genellikle bu defterdir — beyin değil. Ve bu, bölümün son fikrine zemin hazırlar.

## 6. Uzun sohbetler daha pahalıya gelir: oturma planı

> **Tek cümlede:** Bir şirketin "bu yapay zekâ dev sohbetleri yönetir" iddiası beyin gücüyle değil bina alanıyla ilgilidir — her uzun sohbet büyük bir masa kaplar ve sığan masa sayısı sınırlıdır.
>
> **Gündelik tablo:** Kapısında "iki yüz kişilik" yazan bir mekan. Şef tektir — aynı şef kırk kişilik bir bistroda da pişirebilirdi. "İki yüz kişilik" kararı metrekare, yangın yönetmeliği ve masa sayısıyla verilmiştir: ev sahibinin aritmetiği, tarifeler değil. Tabela mekanı satar, ama sayıyı bina belirlemiştir.
>
> **Gerçekte ne oluyor:** Her sohbet, mutfağın kıymetli belleğinden bir dilim kaplar ve bu dilim, sohbet uzadıkça istikrarlı biçimde büyür. Bir düzine orta uzunluktaki sohbeti rahatça ağırlayan aynı mutfak, belki yalnızca birkaç çok uzun sohbeti yönetebilir — aynı mutfak, aynı beyin, aynı kira. Bu yüzden şirketler büyük-sohbet yeteneğini premium bir ürün gibi değerlendirir: daha yüksek fiyatlar, özel seviyeler, tek seferde ne kadar gönderebileceğine dair katı sınırlar. Bu bir oturma kararıdır — yetenek gibi satılır.
>
> **Neden önemli:** Çok uzun sohbetlere bel bağlıyorsan, bu alan için ödemeye hazırlıklı ol — ve kalite tuhaflıklarına da: beyinler dev bir not yığınının ortasını dengeli kullanmakta cidden zorlanır; dolayısıyla bir yapay zekâ daha önce söylenen bir şeyi, not kaybolduğu için değil, yığın aranması zorlaştığı için "unutabilir". Bir sohbeti budamak ya da yenisine başlamak yalnızca derli topluluk değildir — gerçek bir mutfakta gerçek bir masa boşaltır.

---

*Bölüm I'in tamamı sade dille bu: suçlanacak üç işçi, kelime parçası denen özel para birimi, ancak parça parça kurulabilen cevaplar, getirmek-le-sınırlı hız ve uzun sohbetleri premium ürün yapan büyüyen defter. Bölüm II mutfağın içine yürür — siparişleri gruplamak, notları paylaşmak ve binlerce insana aynı anda hizmet etmeyi mümkün kılan numaralar.*

# Bölüm II — Motorun içinde, sade dille

Yapay zekânın beyni, sana cevap veren şeyin yalnızca bir parçasıdır. Etrafında bir mutfak vardır: kuyruklar, defterler, aşçılar, ocaklar, fiyatlar. O mutfağın içinden altı fikir — hepsi Feynman yöntemiyle: bir cümle, gündelik bir tablo, gerçekte ne olduğu ve neden önemli.

## 1. Mutfağı yabancılarla paylaşıyorsun

> **Tek cümlede:** Yapay zekâyı senin adına işleten şirket, birçok kişinin siparişini aynı anda tek bir büyük mutfakta pişirir — ve yemeğinin ne kadar hızlı geleceği, yalnızca senin siparişine değil, herkesin siparişlerinin yoğunluğuna bağlıdır.

> **Gündelik tablo:** Bir şehir otobüsü. Bir yolculuğu asla bitirmez, bir yolcunun bütün işlerini bitirmesini asla beklemez. Her durakta işi bitenler iner, bekleyenler biner. Yolculuğun rahattır, çünkü kimse otobüsü rehin almaz. Eski usul kiralık otobüs tersini yapardı: içerideki en yavaş alışverişçinin nihayet avm'den dönmesini beklerdi — ve herkes orada rehin otururdu.

> **Gerçekte ne oluyor:** İlk mutfaklar kiralık otobüs gibi çalışıyordu. Yabancıların siparişlerini tek büyük bir pişirme turuna gruplayıp bütün grubu birlikte bitirirlerdi; böylece tek cümlelik cevap isteyen, on sayfa isteyenin arkasında beklerdi — boşa harcanmış koltuk, boşa harcanmış zaman. Modern mutfaklar, her tek kelime parçası çıktıktan sonra grubu yeniden planlar: biten siparişler anında çıkar, yeni siparişler anında katılır. Sorununla ilgili hiçbir şey değişmediği hâlde yapay zekânın ritminin yoğun saatlerde yavaşlayabilmesinin nedeni budur — daha çok duraklı bir otobüstedesindir.

> **Neden önemli:** Yapay zekâ akşamları aniden yavaş hissettirdiğinde, neredeyse hiçbir zaman sorun senin sorunda ya da beyinde değildir — paylaşılan mutfakta saatlerdir. Bunu bilmek, gayet iyi bir soruyu yeniden yazmak gibi yanlış şeyi "düzeltmeni" engeller.

## 2. Mutfağın not defteri: boşa kâğıt yok, paylaşılan mezeler

> **Tek cümlede:** Mutfak, siparişin üzerinde çalışırken şu ana kadar söylediklerin ve yaptıkların hakkında güncel bir not defteri tutar — ve o defterde akıllanmıştır: kusursuz sıralar değil, her yerde kıyıklar; özdeş sayfalar ise yalnızca bir kez yazılır.

> **Gündelik tablo:** Bir otel, her konuğundan, olası en uzun kalışı için kopmaz bir oda sırası ayırmasını istesin. On gece kalabilir bir konuğa on oda verilirdi — ve çoğu iki gece sonra ayrılır, kimse kullanamayacağı rezerve-boş odalar bırakırdı. Otel yarı boş dururdu ve hâlâ konu çevirirdi. Yeni kural: her konunun geceleri herhangi bir odalarda oturabilir, resepsiyon hangi odada hangi gecenin olduğunu gösteren bir defter tutar. Birdenbire neredeyse hiçbir şey boşa gitmez.

> **Gerçekte ne oluyor:** Mutfağın not defteri — siparişinin o anki güncel kopyası — eskiden israflı biçimde tutulurdu; gerçek ölçümlerde ancak dörtte biri ile üçte biri arasında bir kısmında işe yarar bir şey vardı. İki düzeltme her şeyi değiştirdi. Birincisi, defter artık bellekte her yerde, aynı boyutlu kıyıklar halinde yaşar ve bir defter takip eder; boşluklar her zaman yeniden kullanılabilir. İkincisi — güzel olan kısım — yüz tane yapay zekâ yardımcının hepsi siparişine aynı talimat sayfasıyla başladığında, mutfak o ortak sayfayı bir kez yazar ve herkes ona işaret eder; yüz özdeş tabak söylemek yerine her masanın tek bir meze tabağını paylaşması gibi.

> **Neden önemli:** Aynı açılış kelimeleriyle — aynı talimatlar, aynı belgelerle — yapay zekâya tekrar sormak, ikinci kez neredeyse bedava ve çok daha hızlı olabilir, çünkü mutfak kendi notlarını tanır. Ama en baştaki tek bir kelimeyi değiştir, notlar artık eşleşmez ve yeniden tam fiyat ödersin. Değişikliklerini nereye koyduğun, neyi değiştirdiğin kadar önemlidir.

## 3. Önce bütün menüyü okumak, sonra her tabağı servis etmek

> **Tek cümlede:** Her siparişte gizlice iki farklı iş vardır — verdiğin her şeyin bir büyük hızlı okunması ve sonra cevabın kelime parçası parçası yavaş ve dikkatli üretilmesi — ve tek bir tezgâhı paylaştıklarında birbirlerinin ayağına basarlar.

> **Gündelik tablo:** Tek tezgâhlı bir food truck. Bir cateringci gelir, dört yüz taco istiyor — harika iş, fırınlar dolu, çok verimli. Ama o dev sipariş tezgâhı esir alırken, her tezgâha yürüyen müşteri tacısız beklemektedir. Mutfak, herkese en yavaş geldiği anda tam da en verimli işini yapmaktadır.

> **Gerçekte ne oluyor:** Bütün isteğini okumak — talimatların ve belgelerin bulunduğu uzun kısım — catering işidir: tek güçlü süpürüşte yapılır. Cevabı üretmek ise tezgâh işidir: her adımı hızlı ama öne atlanması imkânsız küçük adımlarla, çünkü her kelime parçası öncekine bağlıdır. Eski mutfaklar herkesi tek tezgâhta çalıştırıyordu; kocaman bir okuma işi geldiğinde, sürmekte olan her cevap cümle ortasında donardı. Modern mutfaklar dev okuma işini, normal fişlerin arasına kaydırılan tepsilere dilimler; sürmekte olan cevaplar ritmini korur, sadece birazdan başlar.

> **Neden önemli:** O gizemli cevap-ortası duraklama — yapay zekânın akıcı yazması, sonra bir an takılması — çoğu zaman başkasının dev belgesinin okunuyor olmasıdır. Ve senin uzun isteklerin de başkalarına aynısını yapar. Uzun yapıştırmalar, cevap kısa bitsa bile bedava değildir.

## 4. Önden tahmin et, topluca kontrol et

> **Tek cümlede:** Mutfak, kalfa bir aşçının olası sıradaki birkaç kelime parçasını kurşun kalemle yazmasına, sonra ustabaşının hepsini tek bakışta kontrol etmesine izin verebilir — ve tahminler iyiyken, bir parçanın fiyatına birkaç parça alırsın.

> **Gündelik tablo:** Bitmiş bir Sudoku bulmacasını çözmek çoğu insana bir saat sürer, kontrol etmek ise bir dakika. Şimdi bulmaca şampiyonunun dakikasıyla ücret aldığını ve hevesli bir arkadaşın şampiyon bakmadan önce beş tahmini kurşun kalemle yazdığını düşün. Tek bir süzme — tek bir kareyi kontrol etmekten ancak biraz fazla iş — doğru olanı korur, yanlış olanı düzeltir. Aynı şampiyon, aynı ücret, saatte çok daha fazla bitmiş kare.

> **Gerçekte ne oluyor:** Bir kelime parçası üretmek normalde bütün beynin bir tam turunu gerektirir — kaçamayacağın geçiş ücreti budur, çünkü her parça öncekine bağlıdır. Numara şudur: birkaç önerilen parçayı kontrol etmek, bir tane üretmekle neredeyse aynı tutar, çünkü pahalı kısım beynin bilgisini getirmektir; bir kez getirildikten sonra birkaç tahmine bakmak bedavadır. Ucuz bir tahminci birkaç parça önerir, gerçek beyin hepsini birden gözden geçirir, iyileri korur, ilk hatada yeniden yazar — ve dikkat çekici biçimde, nihai metin, gerçek beyin her parçayı kendisi yazmış gibi tamamen aynı çıkacak şekilde kuruludur. Ucuz bir taklit değil; aynı kelimeler, daha hızlı.

> **Neden önemli:** Bu, hiç kaliteye mal olmayan birkaç hız numarasından biridir — uyduğu zaman. Yapay zekâ verilenlere benzeyen metni yeniden yazarken ya da sürdürürken parlar; cevabın kesin biçimler gibi katı şekiller izlemesi gerektiğinde ise en az yardım eder — tahminler sürekli çöpe atılır. Kendi mutfağını işletiyorsan, yalnızca bu ayar, aynı makinede koca bir beynin yazma hızını ikiye katlayabilir.

## 5. Daha küçük yazmak

> **Tek cümlede:** Beynin bilgisi, sayı başına daha az haneyle yazılabilir — tarifeleri tam paragraflar yerine steno ile tutmak gibi — ve bu, taşıyacak daha az şey olduğu için mutfağı hızlandırır; bedeli ise ara sıra oluşan küçük okuma hatasıdır.

> **Gündelik tablo:** Bir fırının usta tarifi "0,8473 fincan şeker" diyor. Yeni bir aşçı "yaklaşık çeyrek fincandan biraz fazla" yazıyor. Pankek için kimse fark etmez. Kimyanın minik hataları cezalandırdığı bir makaron için ise parti bazen başarısız olur. Aynı tarif, daha az ondalık hanesi, daha hızlı okuma, ara sıra kayıp.

> **Gerçekte ne oluyor:** Beynin bildiği her şey sayılar olarak saklanır ve bu sayıları bellekten kullanıldıkları yere taşımak, yazma hızının gerçek darboğazıdır. Her sayıyı daha az haneye yuvarla — stenoyu sakla — ve taşınacak şey basitçe azalır: haneleri yarıya indirmek kabaca hızı ikiye katlar, dörtte biri kabaca dörde katlar. Püf noktası şu: sayıların birkaçı diğerlerinden çok daha önemlidir — tarifteteki tuz ve safran gibi — dolayısıyla iyi yuvarlama yöntemleri önce gerçek trafiği izleyip hangi sayıları koruyacaklarını öğrenir. Dikkatsiz yuvarlama en zor görevleri — uzun dikkatli muhakeme ve çetrefilli matematik — sessizce zedeler; basit görevler ise iyi çıkar. Aynı beynin daha küçük, daha hızlı sürümlerinin bir menüde çok farklı fiyatlarla yan yana durmasının nedeni budur.

> **Neden önemli:** Bir şirket sevdiğin bir yapay zekânın "hızlı" ya da "mini" sürümünü sunuyorsa, o genellikle steno yazılmış aynı beyindir. Taslak, özet ve gündelik sorular için ucuz hızlı olanı al. Küçük bir hatanın her şeyi mahvettiği zor muhakeme için tam hassasiyetli aslına öde — ya da küçük olanı önce kendi en zor örneklerinde dene.

## 6. Tek dev sipariş: çok ocak ve düğün problemi

> **Tek cümlede:** Bir sipariş tek mutfağa sığmayacak kadar büyükse — beyin kendisi çok büyük ya da sohbet çok uzun olduğundan — iş birçok mutfağa bölünür ve uzun sohbetler, uzunluklarının ima ettiğinden çok daha pahalıya gelir.

> **Gündelik tablo:** Bir catering şirketi bir düğün kazanır. Tarif koleksiyonu artık tek mutfağa sığmaz, bölünür: her mutfak tariflerin bir dilimini, her mutfak konukların bir dilimini tutar ve koşucular mutfaklar arasında yarım yapılmış tabakları taşır; böylece düğün tek ocaktan çıkmış gibi hissedilir. İşler — ama koşucular hep meşguldür ve düğün büyüdükçe koşmak kazanımları daha çok yiyip bitirir.

> **Gerçekte ne oluyor:** İki farklı şey tek mutfağı aşar. Birincisi, en büyük beyinler fiziksel olarak tek bir çipte tutulamayacak kadar büyüktür; bilgileri birbirine sürekli parça uzatan birçok çipe yayılır — tarifleri böl, konukları böl ya da aynı şubeleri aç — ve en büyük modern beyinler daha da ileri gider: bir uzmanlar kalabalığı tutar; her kelime parçası yalnızca ihtiyaç duyduğu birkaç uzmana danışır. Dev bir beynin bazen daha küçük bir all-round'dan hızlı cevap verebilmesinin nedeni budur. İkincisi, çok uzun bir sohbetin kendisi bir düğündür: yapay zekâ tek kelime söylemeden önce verdiğin her şey diğer her şeyle çapraz kontrol edilmelidir ve bu çapraz kontrol acı verici hızda büyür — yığını ikiye katlamak, kontrolü ikiye katlamaktan çok daha fazlasını yapar.

> **Neden önemli:** Çok uzun sohbetler, biraz daha uzun kısa sohbetler gibi fiyatlanmaz — şirketler bunlara ek ücret uygular, bazıları bir boyut sınırını geçtiğin anda sıra atlama ücreti keser. Çözüm derli topluluktur: değişmeyen talimat ve belgeleri önde tut (fikir ikideki ortak notlar çalışsın) ve her şeyin yığılmasına izin vermek yerine ortayı budayıp özetle. Düzenli bir uzun sohbet, aynı faydayla sonuçlanan dağınık bir sohbetten çoğu zaman birkaç kat daha ucuzdur.

---

## Bölümün tamamı tek nefeste

Mutfak, yakıttan tasarruf için yabancıları gruplar ve her kelime parçasında grubu yeniden planlar. Güncel defterini yeniden kullanılabilir kıyıklarda tutar, ortak sayfaları bir kez yazar. İki işi — yığınını okumak, sonra cevabı tabaklamak — birbirini dondurmaması için ayırır. Kalfanın tahmin etmesine, ustanın topluca kontrol etmesine izin verir. Daha az taşımak için tarifeleri steno yazar. Ve bir sipariş tek mutfağı aşınca — dev bir beyin ya da düğün boyu bir sohbet — işi yayar ve buna göre ücretlendirir. Bunların hiçbiri beyin değildir — ama hepsi, beynin sana nasıl geldiğini belirler.

# Bölüm III — Senin ile mutfak arasındaki anlaşma

Rehberin ilk iki bölümü mutfağın içine girdi: kelime parçası para birimi, getirmek turları, grup-sipariş numarası, siparişinin güncel kopyası. Bu bölüm anlaşma hakkındadır — senin ile mutfak arasındaki, yemeğinin nasıl geleceğini, hangi biçimde geleceğini, kendini tekrar etmenin ne tuttuğunu, hangi hızda sipariş verebileceğini ve yer tıka basa doluyken nasıl davranılacağını belirleyen yazılı olmayan sözleşme. Bu beş fikir, çoğu insanın hiç fark etmeden en çok parayı kaybettiği yerdir.

## 1. Tabaklar tek tek gelir — ve ilk tabak en uzun sürer

> **Tek cümlede:** İyi bir mutfak, bütün yemeğin paketlenmesini beklemez — tabaklar hazır oldukça çıkar ve beklemenin neredeyse tamamı, çok ilk tabaktan önce gerçekleşir.
>
> **Gündelik tablo:** Konveyörlü suşi restoranı. Oturursun, sipariş verirsin ve ilk tabak hazır olduğu an sana doğru kayar — sonra sıradaki, sonra sıradaki, istikrarlı bir ritimle. Alternatif, paket servis: bütün yemek bir anda önüne gelene kadar açlıkla tezgâha yaslanıp hiçbir şey izlersin. Aynı yemek, aynı mutfak — bekleme deneyimi bambaşka.
>
> **Gerçekte ne oluyor:** Her cevapta üst üste iki ayrı bekleme vardır: ilk parça görünmeden önce daha uzun bir bekleme, sonra parçalar arasında hızlı ve istikrarlı bir ritim. Seri hissettiren ama "yavaş yazan" bir cevapta sorun rittir. Bir şey söylemeden sessizce asılı kalan bir cevapta sorun ilk tabaktır — ve hiçbir yazma hızı yükseltmesi ilk tabak beklemini düzeltmez. Gizli bir tehlike de var: sipariş ortasında çıkarsan (iptal, uygulamayı kapat, bağlantı kopar), köşedeki mutfak bunu bir süre fark etmeyebilir — ve bir koşucu köşeyi dönüp aşçıya gittiğini söyleyene kadar yemeğini pişirmeye, muhtemelen faturalandırmaya devam eder.
>
> **Neden önemli:** Yapay zekâ üzerine kurulu bir araç yavaş hissettirdiğinde, beklemenin *nerede* olduğuna bak — ilk kelimeden önce mi, kelimeler arasında mı — çünkü bu iki beklemeden farklı kişiler sorumludur ve çözümleri tamamen farklıdır. Ve iptal ettiğinde, mutfağın fark edene kadar pişirmeye devam edebileceğini varsay.

## 2. Kompoziyon yerine form üzerinde sipariş vermek

> **Tek cümlede:** Bazen mutfağın cevabını sabit bir biçimde — kompozisyon değil, doldurulmuş bir form olarak — gerekir; biçimi garanti eden gerçek bir makine vardır, ama garanti mutfağa efora mal olur ve pişirmenin önüne geçebilir.
>
> **Gündelik tablo:** Kağıt bir formu tuş tuş dolduruyorsun ve arkanda sert bir gözetmen duruyor. Her tuştan önce gözetmen, yasal olarak sıradaki gelemeyecek tuşları kapatır. Formda "yaş" yazıyorsa harf tuşları kapalıdır — yalnızca rakamlar serbesttir. Hangi rakamı seçeceğini yine sen belirlersin; yaşı yine de yanlış yazabilirsin. Ama yaş kutusuna "otuz" yazman fiziksel olarak imkânsızdır. Gözetmen garantidir. Kapatılan tuşlar ise bedelidir.
>
> **Gerçekte ne oluyor:** Bazı yapay zekâ şirketleri "gözetmeni" yerleşik sunar: cevap, üretildikçe yanlış biçimli parçalar engellenerek belirttiğin kesin biçime zorlanır — her seferinde. İşler — ama üç şekilde tutar. Kural kitabı, açsan da açmasan da her yolculukta taşınmalıdır; kurallar uygulanırken her kelimede küçük bir geçiş ücreti ödenir; ve — kimsenin reklamını yapmadığı kısım — form bazen aşçının pişirmek istediği biçimle kavga eder ve yemek, serbest bir kompozisyon olarak çıkacağından biraz daha kötü çıkar. İnce yazıya da dikkat: bazı şirketlerde "garantili biçim" formun noter onaylı olması demektir; bazılarında yalnızca cevabın bir *kutuda* gelmesi demektir — içinde her şey sekerek dolaşabilir.
>
> **Neden önemli:** Cevabı senden sonra bir makine okuyacaksa, formu iste — kötü biçimli tek bir cevap, ardından gelen her şeyi çökertebilir. İnsan okuyacaksa, şefe kompozisyonu yazdır. Ve bir menüdeki "yapılandırılmış" kelimesine, hangi sözü kastettiğini sormadan güvenme.

## 3. Mutfak her zamanki siparişini hatırlar

> **Tek cümlede:** Aynı açılış kelimelerini tekrar tekrar gönderirsen — kalıcı talimatlarını, her zamanki siparişini — mutfak, onları okumak için zaten yaptığı işin bir kopyasını tutabilir ve o kopyayı yeniden kullanmak, taze kelimeler göndermekten yaklaşık on kat daha ucuza gelebilir.
>
> **Gündelik tablo:** Bir kahvecinin damgalı müşteri kartı. Kayıt olmak normal bir kahveden biraz daha pahalıdır — kartı kurmak için küçük bir ücret. Ama ondan sonraki her kart ziyareti yaklaşık yüzde doksan indirimlidir. Püf noktası: kart her satın alımdan birkaç dakika sonra geçersiz olur. Sipariş ver, iç, pencere içinde tekrar sipariş ver — kart sonsuza dek yaşar. Altı dakika uzaklaş; dükkan kartı yakar — ve sıradaki ziyaretin bembeyaz yeni bir kayıt ücreti öder.
>
> **Gerçekte ne oluyor:** Yapay zekâ şirketleri, isteğinin açılış kısmında zaten yaptıkları okuma işini saklayabilir ve onu yeniden kullanmak için fiyatın küçük bir kesri alabilir — açılış her seferinde, parça parça, *birebir* aynıysa. Para burada saklanır. Tuzak sessizdir: kalıcı kısımdaki herhangi bir yerde tek bir kelimeyi değiştir — bir zaman damgası, bugünün tarihi, herhangi bir şey — ve o değişiklikten sonraki her şey, izleyen her istekte tam fiyatla, üstüne muhtemelen kurulum ücretiyle, bambaşka sayılır. Profesyonellerin kuralı şu: açılışı basılı bir antetli kâğıt gibi dondur (logo, adres, yasal dipnot) ve değişen her şeyi — tarihi, bugünün sorusunu — en sona koy.
>
> **Neden önemli:** Kendini tekrar etmek yalnızca israf değil — bu işteki *en büyük kontrol edilebilir maliyettir*. Kalıcı talimatlarına sinsi bir zaman damgası, faturanı sessizce katlayabilir ve bu anlaşmanın varlığını bilmeden bunu asla görmezsin.

## 4. Kapı politikası: çok hızlı, çok fazla sipariş

> **Tek cümlede:** Her mutfak ne hızda sipariş gönderebileceğini sınırlar — seni cezalandırmak için değil, binanın arkasındaki paylaşılan borudan ancak o kadar su geçtiği için — ve doğru tepki, *neden* geri çevrildiğine bağlıdır.
>
> **Gündelik tablo:** Bir apartmanın su kaynağı. Sokak ana borusu sabit genişlikte tek borudur; binadaki kimse onu değiştiremez. Herkes sabah yedide duş alırsa basınç herkese düşer — bu yüzden su şirketi her daireye akış kısıtlayıcı takar. Kısıtlayıcı duşların hakkında ahlak dersi vermiyor; herkesin paylaştığı boruyu koruyor. Bir "çok fazla istek" reddi, kapı politikası kılığına girmiş o kısıtlayıcıdır.
>
> **Gerçekte ne oluyor:** Geri çevrildiğinde neden önemlidir. "Bu dakikada üç kez sipariş verdin" hızınla ilgilidir — biraz bekle ve geri gel. "Hesabın limitine ulaştı" cüzdanınla ilgilidir — kapıda ne kadar beklesen bu gece düzelmez; plan sıfırlandığında gel. "Mutfak yanıyor" *onlarla* ilgilidir — herkes bekler, sen dahil, ve gelen bir masa yoktur. Üçü de uzaktan aynı görünür (bir ret) ama yalnızca birincisi tekrar denemekle düzelir. Ve tuzak şu: bütün bir otomatik yardımcı sürüsü geri çevrilir ve hepsi aynı an için kapıyı tekrar çalarsa, çektikleri aşırı yükü kendileri ikiye katlar. Terbiyeli yardımcılar her biri kendi rastgele anını seçip tekrar dener.
>
> **Neden önemli:** Kazanan hamle daha akıllıca tekrar denemek değil — *tempo tutmaktır*: iyi bir yardımcı kapı politikasına bakar, siparişleri politikanın izin verdiği hızda gönderir ve hiç geri çevrilmez. Ve mutfakların farklı saydığını bil: bazıları ödenen payı, yediğin yemekten değil, *belki sipariş edebileceğin* en büyük tabaktan keser.

## 5. İşe göre mutfak seçmek

> **Tek cümlede:** Her yemek aynı mutfağı gerektirmez — hızlı öğle yemeğini hızlı küçük lokantaya, dev bir ziyafeti ucuz büyük cateringciye gönder ve siparişten önce mutfağı işe uygun seç.
>
> **Gündelik tablo:** Bir hastanenin triyaj hemşiresi. Gribi pratisyene gider; göğüs ağrısı cerraha. Cimrilik etmiyor — maliyeti ihtiyaca eşitliyor, çünkü cerrahlar pahalı ve azdır, çoğu hasta da cerrahi değildir. Herkesi "güvenli olsun" diye cerraha gönderirsen iki kez başarısız olursun: cerrahi bakım seyrekleşir ve fatura dev olur.
>
> **Gerçekte ne oluyor:** Bir yapay zekâya gönderdiğin işin çoğu kolaydır — sınıflandırma, etiketleme, kısa cevaplar — ve ucuz, hızlı bir yapay zekâ bunu pahalı amiral gemisi kadar iyi yapar. Hüner, sipariş çıkmadan *önce* hangisinin hangisi olduğunu bilmektir ve bu öğrenilmiş bir beceridir: kolay istekleri ucuz mutfağa, zorları güçlü mutfağa yönlendiren ekipler, faturalarını kabaca yarıya indirip neredeyse hiç kalite kaybetmediklerini bildirmektedir. Ayrıca kimsenin yeterince kullanmadığı sürekli bir indirim vardır: gece şeridi. Yalnızca *sonunda* gelmesi gereken her şey — yarın sabaha hazır olması gereken bir yığın rapor, gecelik bir kontrol — yarı fiyatla gece teslimatına binabilir: aynı yemek, daha geç varış.
>
> **Neden önemli:** En pahalı tek alışkanlık, her şeyi "güvenli olsun" diye en güçlü, en pahalı mutfağa göndermektir. İki mutfak seç — biri ucuz, biri güçlü — ve hangi siparişlerin hangisini gerektirdiğine karar ver. Tekrarlanabilir, kimsenin beklemediği işleri gece şeridine koy; sürekli bir yarı fiyat kuponunu reddetmek, demiryoluna hayır demektir.

## 6. Gözde mutfağın kapandığında

> **Tek cümlede:** Her müdavimin yedek bir mutfağa ihtiyacı vardır — önceden seçilmiş, sırayla denenmiş, birinden ne zaman vazgeçilip geçileceğine dair bir kuralıyla — çünkü gözde mutfağın tıka basa dolu ya da kapalı olduğu gün, bütün operasyonun da onunla birlikte durmamalıdır.
>
> **Gündelik tablo:** Bir evin sigorta kutusu. Akım, hatalar bir çizgiyi aşana dek normal akar — sonra sigorta atar ve o priz için her sonraki deneme, elektrik tehlikeli yolculuğu hiç yapmadan *anında, sigortada* başarısız olur. Bir moladan sonra prizi yalnızca birkaç ışık açıkken tekrar deneriz: hata gittiyse devre kapanır; yeni sigorta da atarsa priz ölü kalır. Arızalı bir cihazı "kontrol için" defalarca takmaya devam etmezsin — kontrolü, evinin tamamıyla değil bir damlayla sigorta yapar.
>
> **Gerçekte ne oluyor:** İyi kurulmuş düzenler sıralı bir mutfak listesi tutar: ilki birkaç dürüst denemeden sonra siparişi alamıyorsa çağrı ikinciye, sonra üçüncüye geçer. Diğerlerinden daha önemli tek kural vardır: masanı yemek *başında* çöz, her tabak arasında değil. Üçüncü fikirdeki hafıza anlaşması yalnızca siparişini *aynı* mutfağa göndermeye devam edersen işler — her farklı mutfağa atlayış, yeni mutfağın kalıcı talimatlarını hiç görmemiş olduğu ve bütün o okuma işini yeniden yapması (ve yeniden ücretlendirmesi) demektir. Mutfaklar arasında sürekli zıplarsan her yerde, her seferinde sessizce kayıt ücreti ödersin.
>
> **Neden önemli:** Dayanıklılık ve indirim zıt yönlerde çeker; bu gerilimi bilmek bu işi anlayan kişinin imzasıdır. Yedeklerini acil durumdan *önce* seç — ve bir yemek başladıysa, mutfağın cidden yanmıyorsa ondan ayrılma.

---

*İşte bütün anlaşma: tabakları izle, cevabı bir makine okuyacaksa form üzerinde sipariş ver, kalıcı siparişini donmuş tut, kapı politikasına saygı göster, mutfağı yemeğe uygun seç ve her zaman bir yedeğin olsun. Bölüm IV hepsini birleştirir.*

# Bölüm IV — Sen, akıllı müşteri: lokantanın seni hatırlamasını sağlamak

İlk üç bölüm seni mutfağın içinden geçirdi: siparişlerin nasıl gruplandığını, yazmanın neden okumaktan yavaş olduğunu ve şirketin ne için ücret kestiğini. Bu son bölüm senden bahsediyor — müşteriden. Restoranlar hakkında garip bir kuralı bilen müşteriler, diğer herkesin ödediğinin kesrini öder. İşte kitabın son bölümü, altı fikirde.

## 1. Açılış kelimelerini her seferinde birebir aynı şekilde söyle

> **Tek cümlede:** Mutfak, siparişinin o anki güncel kopyasını tutar ve sıradaki isteğin geçen seferkiyle birebir aynı kelimelerle başlıyorsa, o kelimeler için fiyatın kesrini alırından keser — ama erken kısımlardaki herhangi bir yerde tek bir kelime değiştirirsen, o değişiklikten sonraki her şeyi tam fiyatla yeniden okur, üstüne kopyasını yeniden kurmak için küçük bir ücret alır.
>
> **Gündelik tablo:** Her sabah "her zamankini" söyleyen bir müdavim. Garson kalıcı siparişinin tamamını kafasında tutar ve her yeni ek ("bir de yanına bacon") zaten bildiği şeylerin üzerine biner. Ama şunu düşün: garson bunu bir yazı tahtasında tutuyor, tek bir acımasız kuralla — üst sıralara yakın *herhangi* bir satırı yeniden ifade ettiğin anda, tahtayı o satırdan aşağı siler ve bütün siparişini baştan, tam menü fiyatından alır. Bir kez "tost"u "yumurtadan" önce söyle ve yeniden yabancı olursun.
>
> **Gerçekte ne oluyor:** Bir yapay zekâyla çok sayıda tur boyunca konuştuğunda, gönderdiğin her şey — talimatların, araçların ve şu ana kadarki bütün sohbet — her turda şirketin mutfağı tarafından yeniden okunur. Mutfak, zaten okuduğu her şeyin güncel kopyasını sessizce tutar; böylece özdeş açılışlar normal fiyatın yaklaşık onda birine okunur. Ama tasarruf, kelimeler en ilk kelimesinden itibaren birebir eşlediği sürece vardır. Çözüm disiplindir: hiç değişmeyen kısımları — kalıcı talimatlar, kurallar, kaynak belgeler — her zaman aynı sırada ve aynı ifadeyle en üstte dondur; yalnızca yeni şeyler en sona yığılsın.
>
> **Neden önemli:** Bu şekilde yönetilen uzun bir sohbet, özensiz yönetilen aynı sohbetin kesrindedir — aynı kelimeler, aynı cevaplar, bambaşka fatura. Yazılımının talimatlarını her gönderişte farklı sıraya dizmesi gibi ekranda hiçbir şey farklı görünmeyen görünmez bir şey bile, her isteğin sessizce tam fiyat ödemesini sağlayabilir.

## 2. Yemeğin ortasında siparişini baştan yazma

> **Tek cümlede:** Uzun süren siparişini kısa bir özetle değiştirmek bazen değer, bazen israf — her zaman bir kez tam fiyatlı yeniden okuma maliyeti çeker ve ancak yeterince gelecek yolculuk daha ucuz, daha kısa siparişin tadını çıkaracaksa kendini amorti eder.
>
> **Gündelik tablo:** Saatlerdir restorandasın ve mutfakta asılı fiş sayfalar uzunluğunda. Personel koparıp tek satırlık yeni bir fiş başlatmasını isteyebilirsin: "dört numaralı masa — her zamanki, artı ikiden beri kararlaştırılan her şey." Bu andan itibaren mutfak dört sayfa yerine tek satır okur. Ama o taze fiş, seni bembeyaz yeni bir müşteri gibi yazılır: her şey bir kez daha tam fiyatla yeniden okunur ve eski tasarruf gider. Tam ödeyip çıkacağın sırada yaparsan, hiç kullanmadığın bir kısayol için ödemiş olursun.
>
> **Gerçekte ne oluyor:** Uzun yapay zekâ sohbetleri sonunda sıkıştırılır — erken gidiş gelişler kısa bir yazılı özetle değiştirilir — böylece sohbet çalışmaya devam edebilecek kadar küçük kalır. Sıkıştırmanın gizli bir bedeli vardır: ilk özetlenen satırdan itibaren güncel-kopya tasarrufunu bozar; dolayısıyla sıradaki istek bir kez tam bedel öder ve ancak ondan sonra çok daha kısa bir geçmişin daha ucuz okumalarının keyfini sürer. Pratik kural: daha gidecek çok yolun varsa sıkıştır, son virajda asla — ve neredeyse herkesin yanlış yaptığı kısım — bir süre uzaklaşmadan *önce* sıkıştır, geri geldikten sonra değil.
>
> **Neden önemli:** Sıkıştırmayı yanlış zamanlamak, uzun bir çalışma seansının faturasını ikiye katlayan sessiz yollardan biridir; doğru zamanlamak — uzun bir moladan hemen önce yoğunlaştırmak — faturayı düşürmenin en kolay yollarından biridir.

## 3. Sessiz kalırsan mutfak seni unutur

> **Tek cümlede:** Mutfağın, siparişinin güncel kopyası için son kullanma tarihi sessizlik dakikalarıyla ölçülür; süre dolduğunda, özdeş siparişle bir yabancı gibi geri dönersin — tam yeniden okuma, artı yeniden kurma ücreti, artı mutfak her şeyi yeniden okurken yavaş bir ilk cevap.
>
> **Gündelik tablo:** Palanı, fişine son dokunmandan sonra yalnızca beş dakika tutan bir vestiyer. Sohbet sürdükçe saat kendiliğinden bedava sıfırlanır. Öğle yemeğine uzaklaş, ikide geri gel — palan yığının geri dönmüştür; görevli onu bulup getirecektir ama bulup kontrol edip uzatırken sen tezgâhta beklersin, sanki hiç orada olmamış gibi. Sahip olduğun hiçbir şey kaybolmadı; sadece kuyruğun arkasına yeniden katıldın.
>
> **Gerçekte ne oluyor:** Aldığın her cevap, mutfağın seni hatırlamasını sessizce daha ileriye iter; süregiden bir sohbet saati hiç fark etmez. İzin verilen sessizlik süresinden uzun duraklattığın anda kayıtlı kopya atılır. Sıradaki mesajın, bütün geçmişinin okuma maliyetini yeniden öder — ve cevap yeniden okuma bitmeden başlayamayacağı için geri dönüşünün ilk kelimesi belirgin biçimde geçtir. Bazı planlar, biraz daha dik bir yeniden kurma fiyatıyla daha uzun sessizlik süresi sunar; gününde iki ya da daha uzun duraklama olduğunda buna değer.
>
> **Neden önemli:** Yardımcın sen çalışırken anında, toplantılardan döndüğünde ağır geliyorsa, bozuk bir şey yok ve kimse yavaş değil — her seferinde giriş ücretini yeniden ödüyorsun. Bunu bilerek, gerçekte nasıl ara verdiğine uyan planı seçebilirsin.

## 4. Tüm hikâyeyi değil el kitabını taşıyan yardımcılar gönder

> **Tek cümlede:** Yardımcın araştırma, sorma ya da kontrol için yardımcı yardımcılar gönderdiğinde, iyi işleyen bir sistem her yardımcıya aynı dondurulmuş açılış sayfalarını — bir şirket el kitabı gibi — verir; böylece mutfak onları zaten okumuştur ve her yeni yardımcı için neredeyse hiç ücret almaz.
>
> **Gündelik tablo:** Elli saha denetçisi işe alan bir genel merkez. Her denetçiye kişisel elli sayfalık brifing yazmak yerine, tek bir standart el kitabı basar — katılan herkesin ilk gün okuması — ve her denetçi için tek sayfalık özel talimat ekler. Merkez el kitabının bir kez okunmasına öder. Her yeni denetçi "önceden okunmuş" gelir, yalnızca kendi tek taze sayfasını taşır. Bunu, her biri tüm şirket tarihini telefonla tek tek ve uzun mesafe tarifesiyle okuyan elli denetçiyle karşılaştır.
>
> **Gerçekte ne oluyor:** Büyük yapay zekâ görevleri çoğu zaman daha küçük yardımcılara bölünür — biri belgeleri okur, biri sayıları kontrol eder, biri raporu yazar. Her biri kendi tam isteğini mutfağa gönderir. Değişmeyen kısım — kurallar, araçlar, arka plan — hepsinde kelimesi kelimesine özdeşse, mutfağın kayıtlı kopyası neredeyse her şeyi kapsar ve her yardımcı yalnızca kendine özgü kuyruğu için öder. Her biri bütün hikâyeyi yeniden anlatan yardımcılar her seferinde tam fiyat öder ve böyle bir sürü, hepsini aynı anda öder — kibar müşterilerin mutfağı kazayla nasıl aşırı yüklediği tam olarak budur.
>
> **Neden önemli:** Paylaşılan donmuş bir el kitabıyla bir yardımcı ekibi, her şeyi tek başına yapan bir yardımcıdan ancak biraz daha pahalıya mal olur; el kitabı yoksa aynı ekip, faturanı ekibin boyutuyla çarpar — ve herkesi yavaşlatır.

## 5. Fişlerini oku — hepsini, tek tek

> **Tek cümlede:** Gönderdiğin her istek kalem kalem bir fişle geri döner — ne kadar taze okundu, ne kadarı önceden tanındı, ne kadar yazıldı, her kısım ne kadar sürdü — ve bu fişleri okuyan müşteriler tahmin etmeyi bırakıp yön vermeye başlar.
>
> **Gündelik tablo:** Her ücret fişini bir ayakkabı kutusunda saklayan bir taksi yolcusu. Ay sonunda taksiler hakkında genel laf etmez; kaydı gösterir — bu yolculuk, bu ücret — ve hangi yolculukların değdiğini, hangi gün yoğunluk fiyatlamasının faturayı ikiye katladığını bilir. Ayakkabı kutusu, "taksiler pahalı" cümlesini *bu* yolculuk, *bu* hafta hakkında bir karara dönüştürür.
>
> **Gerçekte ne oluyor:** Her cevap kendi fatura detaylarını sessizce taşır — mutfağın taze okuduğu parçalar, senin kayıtlı kopyasından tanıdığı parçalar, yazdığı parçalar ve ilk kelimenin zamanlaması. Çoğu araç bunu saklar; gösterenler kafa karışıklığını aritmetiğe çevirir. Ani bir maliyet sıçraması gizem olmaktan çıkar ve görünür bir cümleye dönüşür: "salı günü ikide tanınan kısım sıfıra düştü — hemen öncesinde açılış kelimelerimizde ne değişti?"
>
> **Neden önemli:** Yapay zekâ faturalarından şikâyet edenlerle onları küçültenleri ayıran tek alışkanlık fişleri okumaktır — çünkü bu rehberin anlattığı her israf kalıbı, bir fişe parmak izi bırakır.

## 6. Zor bir mutfağı görünce tanı — ve cebinde yedek bir lokanta bulundur

> **Tek cümlede:** Mutfak zor durumda olduğunda net sinyaller gönderir — geçen ilk tabaklar, yavaşlayan ritim, kapının yeni müşterileri kısa süre reddetmesi — ve akıllı müşteri, aynı yemeği hangi başka lokantanın sunduğunu zaten bilir; ayrıca evde pişirmenin ne zaman dışarıda yemekten iyi olduğunu da.
>
> **Gündelik tablo:** Aynı sokakta, aynı yemekleri servis eden iki gözde mutfağı olan bir müdavim. İlki tıka basa dolduğunda — fişler yığılıyor, ilk tabaklar geç iniyor — kapı ağzında bağırıp durmaz; elli adım yürüyüp ikincisine geçer. Ve üçüncü seçeneğin aritmetiğini de yapmıştır: her akşam dışarıdan sipariş verir, dolayısıyla bir noktada ev mutfağı — bir kez ödenmiş, sonrasında yalnızca elektrik tüketen — sokaktaki tabak başı bütün faturaları yener. Ama onu, tabakları saydıktan sonra kurmuştur.
>
> **Gerçekte ne oluyor:** Aşırı yüklü bir yapay zekâ mutfağı bilinebilir biçimde davranır: ilk kelimen gelmesi uzar, kelimeler arası ritim geriler ve şirket, kibarca "birazdan tekrar gel" diyerek yeni siparişleri kısa süre reddedebilir. İyi kurulmuş bir düzen bunları sürpriz değil sinyal sayar — yavaşlamayı fark eder, kibarca duraklar ve bir süre için başka bir şirketin mutfağına geçer; ilki toparlandığında döner. Ve iştahı dev ve istikrarlı olanlar için — her gün, bütün gün — aynı makineleri evde çalıştırmak sonunda daha ucuza gelebilir: mutfak siparişini hiç unutmaz ve kapıda kuyruk olmaz. Kitaptan dürüst aritmetik: küçük iştahlar hep kiralasın; dev ve istikrarlı olanlar alabilir; sınır, ev mutfağının gerçekte ne kadar meşgul olacağına bağlıdır.
>
> **Neden önemli:** Sinir bozucu bir akşam ile akıcı bir akşam arasındaki fark, nadiren tek bir mutfağın kalitesidir — fark, hangisinin zor durumda olduğunu fark etmiş olmanda ve acıkmadan önce gidecek başka bir yerin olup olmadığındadır.

---

Kitabın tamamı sade dille bu. Beyin harika; mutfağın sana kaça mal olacağına karar verir; ve mutfağı anlayan müşteri — aynı açılış kelimeleri, iyi zamanlanmış özetler, paylaşılan el kitaplı yardımcılar, ayakkabı kutusunda fişler, cebinde yedek lokanta — herkesle aynı zekâyı, fiyatın kesriyle alır. Bu alışkanlıkların her biri bugün başlanabilir.

---

## Tüm kitap tek bir peçetede

1. Her cevabın arkasında üç işçi durur: beyin, mutfak ve sen.
2. Fatura, mutfağın kendi para birimiyle kesilir: kelime parçaları.
3. Cevaplar bir parça ile gelir — tek koşuculu bir bayram koşusu.
4. Hızı getirmek belirler, düşünmek değil. Daha çok şef, merdiveni genişletmez.
5. Her sohbet, şu ana kadar söylenen her şeyin güncel bir kopyasını kullanır — uzun sohbetler gerçek para tutar.
6. Mutfağı yabancılarla paylaşırsın. Siparişleri gruplandırmak, ucuza tutmanın yoludur.
7. Siparişini okumak ile cevabı yazmak, iki farklı hızlı iki farklı iş.
8. Mutfaklar artık önden tahmin edip topluca kontrol ediyor — kalfa yazar, usta onaylar.
9. Steno notlar mutfakları hızlandırır ve ara sıra yanlış okur.
10. Aynı kelimeleri tekrar göndermek, taze kelimelerden on kat daha ucuz olabilir.
11. Her mutfağın bir kapı politikası vardır. Hiçbir müşteri kuyruk için fazla önemli değildir.
12. Akıllı müşteriler işe göre mutfak seçer: öğle için hızlı, catering için ucuz, acil durum için yedek.
13. Açılış kelimelerini her seferinde aynı şekilde söyle, mutfak seni tanır.
14. Fişlerini bil. Faturayı okuyan müşteri, faturanın şaşırtamayacağı müşteridir.

Bu on dört satırı kendi tablolarınla bir başkasına öğretebiliyorsan,
kitaba sahipsin. Gerisi detay, aritmetik ve makine dairesinin keyfi.

---

*Bu rehber, "Inference Engineering: Inside the Engine Room of AI
Agents" (Harness Engineering Series, Vol. II, Arbaz Khan, 2026) kitabının damıtılmış halidir. Tam kitap, aynı fikirleri çalışılmış sayılarla, gerçek sistemlerle ve kendin çalıştırabileceğin küçük bir yardımcı projeyle kurar: github.com/arbazkhan971/inference-engineering-book*
