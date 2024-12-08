% transformations
tfm1  = [255 255 255; -1 -1 -1];              % color inversion
tfm2  = [128 128 128; -1 -1 -1];              % color inversion and darkening
tfm3  = [0 0 0; 1 0 0];                       % red channel
tfm4  = [0 0 0; 0 1 0];                       % green channel
tfm5  = [0 0 0; 0 0 1];                       % blue channel
tfm6  = [0 0 0; 0.5 0.5 0.5];                 % desaturate image
tfm7  = [0 0 0; 1 1 1];                       % identity transformation
tfm8  = [255 0 0; -1 1 1];                    % invert just the red channel
tfm9  = [0 255 0; 1 -1 1];                    % invert just the green channel
tfm10 = [0 0 255; 1 1 -1];                    % invert just the blue channel
tfm11 = [255 128 30; 0 0 0];                  % solid orange
tfm12 = [112 66 20; 0.393 0.769 0.189];       % sepia (kind of).
tfm13 = [50 50 50; 1 1 1];                    % lighten colors
tfm14 = [0 0 0; 1 2 1];                       % green channel boost
tfm15 = [30 0 -30; 1 1 1];                    % warm filter
tfm16 = [-30 0 30; 1 1 1];                    % cool filter
tfm17 = [0 0 255; 0.5 0.5 -1.5];              % something interesting 1
tfm18 = [141.015 68.85 45.135; 0.15 0.854 0]; % something interesting 2
tfm19 = [0 0 0; 0.553 0.270 0.177];           % something interesting 3
tfm20 = [50 -20 30; -0.3 1.5 0.6];            % something interesting 4

for i = 1 : 20
	fprintf("creating Output SVG %d\n", i);

	svg_color_tfm(                                       ...
		"in", "./svg/main-test-in.svg",                  ...
		"out", sprintf("./svg/main-test-out-%d.svg", i), ...
		"M", eval( sprintf("tfm%d", i) )                 ...
	);

	fprintf("\n");
end
