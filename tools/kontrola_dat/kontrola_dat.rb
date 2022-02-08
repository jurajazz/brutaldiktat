# kontrola dat v diktat-data.yaml oproti slovniku
# napisane v jaziku Ruby

require 'yaml'

@je_test_povoleni=false # nastav na true, ak chces vykonat test, ale realnu kontrolu
@treba_vela_informacii=false # nastav na true ak chces vela informacii pocas chodu
@treba_velmi_vela_informacii=false # nastav na true ak chces velmi vela informacii pocas chodu

@pocet_chib=0

puts "Citam diktat..."
diktat_file='../../data/diktat-data.yaml';
diktat = YAML.load_file(diktat_file)
diktat or error "Nepodarilo sa nacitat #{slovnik_file}";
#puts diktat.inspect

len_vypis=false

if len_vypis
	diktat['data']['veti'].each do |veta_rec|
		veta = veta_rec['veta']
		puts veta
	end
	diktat['data']['slova'].each do |slovo_rec|
		slovo = slovo_rec['slovo']
		print slovo+', '
	end
	exit
end

puts "Citam slovnik..."
slovnik_file='../../data/slovnik.txt';
slovnik_vinimki_file='../../data/slovnik_vinimki.txt';
slovnik_file='../../data/slovnik_test.txt' if @je_test_povoleni
@slovnik = File.read(slovnik_file).split("\n")
@slovnik += File.read(slovnik_vinimki_file).split("\n")
puts "Budujem index/hash zo slovniku..."
@slovnik_hash={}
@slovnik.each do |slovnik_zaznam|
	kluce = slovnik_zaznam.split(/\t/)
	kluc = kluce[1]
	@slovnik_hash[kluc]=1
end

# skontroluj, ci vsetki slova su v slovniku
# ak niektore nie je - vrat false
def KontrolaSlov(slova)
	slova.gsub! ',', '' # zrusenie ciarok
	slova.gsub! '.', '' # zrusenie bodiek
	puts "KontrolaSlov -#{slova}-" if @treba_vela_informacii
	slova.split.each do |slovo|
    if KontrolaSlova(slovo)
			# OK
		else
			puts "Slovo -#{slovo}- sa nenaslo v spojeni -#{slova}-"
			@pocet_chib=@pocet_chib+1
			return false
		end
	end
	return true
end

def KontrolaSlova(slovo)
	puts "KontrolaSlova #{slovo}" if @treba_vela_informacii
	naslo_sa=nil
	if slovo.match('\[')
		# obsahuje regex a neda sa naist cez regex
		@slovnik.each do |slovnik_zaznam|
			kluce = slovnik_zaznam.split(/\t/)
			kluc = kluce[1]
			puts "KontrolaSlova #{slovo} oproti slovu -#{kluc}- v slovniku" if @treba_velmi_vela_informacii
			if /^#{slovo}$/.match(kluc)
				naslo_sa=true
				puts "Slovo sa naslo" if @treba_vela_informacii
				break
			end
		end
	else
		# neobsahuje regex - je mozne ho rychlejsie naist cez hash
		puts "KontrolaSlova #{slovo} oproti hash slovniku" if @treba_velmi_vela_informacii
		if @slovnik_hash[slovo]
			naslo_sa=true
			puts "Slovo sa naslo v hashi" if @treba_vela_informacii
		end
	end
	if naslo_sa
		puts "Slovo -#{slovo}- sa naslo" if @treba_vela_informacii
	else
		puts "Slovo -#{slovo}- sa nenaslo" if @treba_vela_informacii
	end
	return naslo_sa
end

# test kontroly
if @je_test_povoleni
	!KontrolaSlova('kôň') or raise "Slovo kon sa naslo v slovniku"
	KontrolaSlova('kniha') or raise "Slovo kniha sa nenaslo v slovniku"
	!KontrolaSlova('zuzkin') or raise "Slovo zuzkin sa naslo v slovniku"
	KontrolaSlova('Zuzkin') or raise "Slovo Zuzkin sa nenaslo v slovniku"
	KontrolaSlova('ps[iy]') or raise "Slovo ps[iy] sa nenaslo v slovniku"
	KontrolaSlov('Zuzkina kniha') or raise "Nie vsetky slova 'Zuzkina kniha' sa nasli v slovniku, ale mali bi sa"
	KontrolaSlov('Zuzkina kniha, psi, kniha.') or raise "Nie vsetky slova 'Zuzkina kniha, psi.' sa nasli v slovniku, ale mali bi sa"
	puts "Koniec testovania. Vsetko OK";
	return
end

# kontrola slov z diktatu
puts "Kontrolujem slova..."
diktat['data']['slova'].each do |slovo_rec|
	slovo = slovo_rec['slovo']
	KontrolaSlov(slovo)
end

# kontrola viet z diktatu
puts "Kontrolujem veti..."
diktat['data']['veti'].each do |veta_rec|
	veta = veta_rec['veta']
	next if veta.nil? # vinechame prazdni zaznam
	puts "Kontrolujem vetu -#{veta}-" if @treba_vela_informacii
	veta_ma_zacat_velkym=false
	veta_ma_zacat_velkym=true if /^Cyril/.match(veta)
	# pridaj dalsie vinimki sem ak sa ma zacinat velkim
	if !veta_ma_zacat_velkym
		veta = veta[0].downcase + veta[1..10000] # zmen prve pismeno z velkeho na male
	end
	KontrolaSlov(veta)
end

puts "Celkovo najdenich #{@pocet_chib} chib."
return 1 if @pocet_chib>0
