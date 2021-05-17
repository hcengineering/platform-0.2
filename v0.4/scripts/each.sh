roots=$(rush list -f --json | grep "fullPath" | cut -f 2 -d ':' | cut -f 2 -d '"')
for i in $roots
do
pushd ${i}
$@
popd
done
