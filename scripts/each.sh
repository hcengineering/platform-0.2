roots=$(yarn workspaces info | grep "location" | cut -f 2 -d ':' | cut -f 1 -d ',' | cut -f 2 -d '"')
for i in $roots
do
pushd ${i}
$@
popd
done
